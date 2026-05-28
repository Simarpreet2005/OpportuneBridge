import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Resume } from "../models/resume.model.js";

const extractYearsExp = (expStr) => {
    if (!expStr) return 0;
    const lower = expStr.toLowerCase();
    if (lower.includes("entry") || lower.includes("fresher")) return 0;
    const match = lower.match(/(\d+)/);
    if (match) return parseInt(match[1]);
    return 0; // default 0
};

const calculateTotalExperienceYears = (experiences) => {
    if (!experiences || experiences.length === 0) return 0;
    let totalMonths = 0;
    experiences.forEach(exp => {
        const start = new Date(exp.startDate);
        const end = exp.isCurrent || !exp.endDate ? new Date() : new Date(exp.endDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            if (months > 0) totalMonths += months;
        }
    });
    return totalMonths / 12;
};

const matchEducation = (jobStr, educations) => {
    if (!educations || educations.length === 0) return 0; // none

    const jobText = jobStr.toLowerCase();
    const needsBachelors = jobText.includes("bachelor") || jobText.includes("b.tech") || jobText.includes("bsc") || jobText.includes("degree") || jobText.includes("undergraduate");
    const needsMasters = jobText.includes("master") || jobText.includes("m.tech") || jobText.includes("msc") || jobText.includes("postgraduate");

    if (!needsBachelors && !needsMasters) {
        // Job doesn't specifically require an education level -> if user has any education, consider it a match
        return 10;
    }

    let userHasBachelors = false;
    let userHasMasters = false;

    educations.forEach(edu => {
        const deg = (edu.degree || "").toLowerCase();
        if (deg.includes("bachelor") || deg.includes("b.tech") || deg.includes("bsc") || deg.includes("b.e")) userHasBachelors = true;
        if (deg.includes("master") || deg.includes("m.tech") || deg.includes("msc") || deg.includes("m.e")) userHasMasters = true;
    });

    if (needsMasters) {
        if (userHasMasters) return 10; // match
        if (userHasBachelors) return 5; // partial
        return 0; // none
    }

    if (needsBachelors) {
        if (userHasBachelors || userHasMasters) return 10; // match
        return 5; // partial (has some education but not specifically matching degree)
    }

    return 5; // partial
};

export const calculateJobMatchScore = (user, resume, job) => {
    // 1. Skills (70%)
    const userSkillsSet = new Set([
        ...(user?.profile?.skills || []),
        ...(resume?.skills || []),
        ...(resume?.aiAnalysis?.matchedSkills || [])
    ].map(s => s.toLowerCase().trim()));
    
    // convert Set back to array for iteration
    const userSkills = Array.from(userSkillsSet);

    const jobSkills = (job.requirements || []).map(s => s.toLowerCase().trim());
    const totalRequiredSkills = jobSkills.length;

    let matchedSkills = [];
    let missingSkills = [];

    jobSkills.forEach(req => {
        let isMatch = false;
        for (const skill of userSkills) {
            if (!skill || !req) continue;
            // check for exact match or substring match
            if (skill === req || skill.includes(req) || req.includes(skill)) {
                isMatch = true;
                break;
            }
        }
        if (isMatch) {
            matchedSkills.push(req);
        } else {
            missingSkills.push(req);
        }
    });

    let skillsScore = 0;
    if (totalRequiredSkills > 0) {
        skillsScore = (matchedSkills.length / totalRequiredSkills) * 70;
    } else {
        skillsScore = 70; // if no skills required, full score
    }

    // 2. Experience (20%)
    let expScore = 0;
    const requiredYears = extractYearsExp(job.experienceLevel);
    const userYears = calculateTotalExperienceYears(resume?.experience);

    if (userYears >= requiredYears) {
        expScore = 20; // match
    } else if (userYears > 0 && userYears >= requiredYears / 2) {
        expScore = 10; // partial
    } else {
        expScore = 0; // none
    }

    // 3. Education (10%)
    const jobText = `${job.title || ''} ${job.description || ''} ${(job.requirements || []).join(" ")}`;
    const eduScore = matchEducation(jobText, resume?.education);

    // Calculate total score
    const matchScore = Math.round(skillsScore + expScore + eduScore);

    // Strengths
    const strengths = [];
    if (skillsScore >= 50) strengths.push("Strong skills match");
    if (expScore === 20) strengths.push("Experience aligns well");
    if (eduScore === 10) strengths.push("Education requirements met");

    return {
        matchScore,
        matchedSkills,
        missingSkills,
        strengths
    };
};
