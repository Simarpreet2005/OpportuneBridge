import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import Groq from "groq-sdk";
import { logger } from "../utils/logger.js";

export const calculateSkillGap = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const userSkills = (user.profile?.skills || []).map(s => s.trim().toLowerCase()).filter(Boolean);

        // Fetch all jobs to aggregate requirements
        const jobs = await Job.find({}).select("requirements title");

        // Aggregate and count job requirements
        const skillFrequencies = {};
        jobs.forEach(job => {
            (job.requirements || []).forEach(req => {
                const normalized = req.trim().toLowerCase();
                if (normalized) {
                    skillFrequencies[normalized] = (skillFrequencies[normalized] || 0) + 1;
                }
            });
        });

        // Sort by frequency (most in-demand)
        const sortedSkills = Object.entries(skillFrequencies)
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count);

        // Find missing skills
        const missingSkills = sortedSkills
            .filter(item => !userSkills.includes(item.skill))
            .slice(0, 5) // Top 5 missing skills
            .map(item => item.skill);

        const currentSkillsDisplay = user.profile?.skills || [];
        
        let advice = "";
        
        // Call Groq for commentary
        if (missingSkills.length > 0 && process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "your_groq_api_key_here") {
            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                const prompt = `User current skills: ${currentSkillsDisplay.join(", ") || "None"}.
Missing in-demand skills on our platform: ${missingSkills.join(", ")}.
Explain in 2-3 concise sentences why these missing skills are important for their career growth and target roles. Be extremely specific and practical.`;

                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: "You are a professional Career Assistant. Provide direct, highly specific career advice in 2 sentences." },
                        { role: "user", content: prompt }
                    ],
                    model: "llama-3.1-8b-instant",
                    temperature: 0.7,
                    max_tokens: 150
                });

                advice = completion.choices[0]?.message?.content?.trim() || "";
            } catch (groqError) {
                logger.warn("Groq error in skill gap service", { error: groqError.message });
                advice = `Skills like ${missingSkills.slice(0, 2).join(" and ")} appear frequently in active job listings for your target roles.`;
            }
        } else {
            // Default static explanation if no Groq key
            if (missingSkills.length > 0) {
                advice = `Skills like ${missingSkills.slice(0, 2).join(" and ")} appear frequently in active job listings for your target roles. Consider learning them to expand your job prospects.`;
            } else {
                advice = "Great job! Your profile skills align well with the job listings on OpportuneBridge.";
            }
        }

        // Capitalize skills for presentation
        const capitalize = (str) => str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        return {
            success: true,
            currentSkills: currentSkillsDisplay,
            missingSkills: missingSkills.map(capitalize),
            suggestedSkills: sortedSkills.slice(0, 8).map(item => capitalize(item.skill)),
            advice
        };

    } catch (error) {
        logger.error("calculateSkillGap Error", { error: error.message });
        throw error;
    }
};
