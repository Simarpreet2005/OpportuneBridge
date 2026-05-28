import Groq from 'groq-sdk';
import { logger } from '../utils/logger.js';

/**
 * Parses an experience string into a minimum number of months.
 * Examples: "Fresher" -> 0, "6 months" -> 6, "1 year" -> 12, "1-3 years" -> 12, "2+ years" -> 24
 */
export const parseExperience = (expStr) => {
    if (!expStr) return 0;
    const str = expStr.toLowerCase().trim();

    if (str.includes('fresher') || str.includes('entry level') || str.includes('none')) {
        return 0;
    }

    let minMonths = 0;
    
    // Check for ranges like "1-3 years" or "1 to 3 years"
    const rangeMatch = str.match(/(\d+)\s*(?:-|to)\s*(\d+)\s*(year|yr|month|mo)/);
    if (rangeMatch) {
        const val = parseInt(rangeMatch[1], 10);
        const unit = rangeMatch[3];
        return unit.startsWith('year') || unit.startsWith('yr') ? val * 12 : val;
    }

    // Check for "X+ years" or "X years" or "X months"
    const singleMatch = str.match(/(\d+)\+?\s*(year|yr|month|mo)/);
    if (singleMatch) {
        const val = parseInt(singleMatch[1], 10);
        const unit = singleMatch[2];
        return unit.startsWith('year') || unit.startsWith('yr') ? val * 12 : val;
    }

    return 0; // Default if not parsed
};

const calculateCandidateMonths = (candidate) => {
    // Check resumes first
    if (candidate.profile?.resumes && candidate.profile.resumes.length > 0) {
        const activeResume = candidate.profile.resumes.find(r => r.isActive) || candidate.profile.resumes[0];
        if (activeResume.experience && activeResume.experience.length > 0) {
            let totalMonths = 0;
            activeResume.experience.forEach(exp => {
                const start = new Date(exp.startDate);
                const end = exp.isCurrent || !exp.endDate ? new Date() : new Date(exp.endDate);
                if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
                    if (months > 0) totalMonths += months;
                }
            });
            if (totalMonths > 0) return totalMonths;
        }
    }
    return 0;
};

const calculateSkillsScore = (candidate, jobRequirements) => {
    if (!jobRequirements || jobRequirements.length === 0) {
        return { score: 60, matchedSkills: [], missingSkills: [] }; // Full points if no requirements
    }

    // Extract skills from requirements array (assuming comma separated or single strings)
    let requiredSkills = [];
    jobRequirements.forEach(req => {
        const parts = req.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        requiredSkills = requiredSkills.concat(parts);
    });
    
    // Deduplicate
    requiredSkills = [...new Set(requiredSkills)];
    
    if (requiredSkills.length === 0) return { score: 60, matchedSkills: [], missingSkills: [] };

    let candidateSkills = [];
    if (candidate.profile?.skills) {
        candidateSkills = candidate.profile.skills.map(s => s.toLowerCase().trim());
    }
    
    if (candidate.profile?.resumes && candidate.profile.resumes.length > 0) {
        const activeResume = candidate.profile.resumes.find(r => r.isActive) || candidate.profile.resumes[0];
        if (activeResume.skills) {
            candidateSkills = candidateSkills.concat(activeResume.skills.map(s => s.toLowerCase().trim()));
        }
    }
    
    candidateSkills = [...new Set(candidateSkills)];

    const matchedSkills = [];
    const missingSkills = [];

    requiredSkills.forEach(reqSkill => {
        // Simple string match for skills
        const matched = candidateSkills.some(cs => cs.includes(reqSkill) || reqSkill.includes(cs));
        if (matched) {
            // Keep original case from job requirements
            const originalReq = jobRequirements.find(r => r.toLowerCase().includes(reqSkill)) || reqSkill;
            matchedSkills.push(originalReq);
        } else {
            missingSkills.push(reqSkill);
        }
    });

    const matchRatio = matchedSkills.length / requiredSkills.length;
    return {
        score: Math.round(matchRatio * 60),
        matchedSkills: [...new Set(matchedSkills)],
        missingSkills: [...new Set(missingSkills)]
    };
};

const calculateEducationScore = (candidate) => {
    // 10% if any education info is present
    if (candidate.profile?.resumes && candidate.profile.resumes.length > 0) {
        const activeResume = candidate.profile.resumes.find(r => r.isActive) || candidate.profile.resumes[0];
        if (activeResume.education && activeResume.education.length > 0) {
            return 10;
        }
    }
    return 0;
};

const calculateProfileCompletenessScore = (candidate) => {
    let completedFields = 0;
    const totalFields = 5;
    
    if (candidate.profile?.profilePhoto) completedFields++;
    if (candidate.profile?.resume || (candidate.profile?.resumes && candidate.profile.resumes.length > 0)) completedFields++;
    if (candidate.profile?.skills && candidate.profile.skills.length > 0) completedFields++;
    if (candidate.profile?.bio) completedFields++;
    
    // Experience check
    let hasExp = false;
    if (candidate.profile?.resumes && candidate.profile.resumes.length > 0) {
        const activeResume = candidate.profile.resumes.find(r => r.isActive) || candidate.profile.resumes[0];
        if (activeResume.experience && activeResume.experience.length > 0) hasExp = true;
    }
    if (hasExp) completedFields++;

    return Math.round((completedFields / totalFields) * 10);
};

export const generateCandidateRanking = async (candidate, job) => {
    const { score: skillsScore, matchedSkills, missingSkills } = calculateSkillsScore(candidate, job.requirements);
    
    const requiredMinMonths = parseExperience(job.experienceLevel || job.experience);
    const candidateMonths = calculateCandidateMonths(candidate);
    
    let experienceScore = 0;
    if (candidateMonths >= requiredMinMonths) {
        experienceScore = 20;
    } else if (candidateMonths >= requiredMinMonths * 0.5) {
        experienceScore = 10;
    } else {
        experienceScore = 0;
    }

    const educationScore = calculateEducationScore(candidate);
    const profileScore = calculateProfileCompletenessScore(candidate);

    const totalScore = skillsScore + experienceScore + educationScore + profileScore;
    
    let strengths = [];
    let improvementSuggestions = [];

    // Optional Groq AI Enhancement
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "your_groq_api_key_here") {
        try {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const prompt = `
            Analyze this candidate profile for a job. Do NOT calculate scores. Provide facts only.
            Score: ${totalScore}
            Matched Skills: ${matchedSkills.join(", ")}
            Missing Skills: ${missingSkills.join(", ")}
            
            Generate a short JSON response with two arrays: "strengths" and "improvement_suggestions".
            `;
            
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.1-8b-instant",
                response_format: { type: "json_object" }
            });
            
            const aiResponse = JSON.parse(completion.choices[0].message.content);
            strengths = aiResponse.strengths || [];
            improvementSuggestions = aiResponse.improvement_suggestions || [];
        } catch (error) {
            logger.error("Groq AI ranking enhancement error", { error: error.message, stack: error.stack });
        }
    }

    return {
        candidateId: candidate._id,
        name: candidate.fullname,
        score: totalScore,
        matchedSkills,
        missingSkills,
        strengths,
        improvementSuggestions
    };
};
