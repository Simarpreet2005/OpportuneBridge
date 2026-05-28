import { User } from "../models/user.model.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { logger } from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { generateCareerResponse } from "../services/careerAssistant.service.js";

export const getCareerAdvice = async (req, res) => {
    try {
        const userId = req.id;
        const { query } = req.body;

        if (!query || query.trim().length === 0) {
            return errorResponse(res, 400, "Query is required");
        }

        // Get user profile
        const user = await User.findById(userId);
        if (!user) {
            return errorResponse(res, 404, "User not found");
        }

        const [applications, jobs] = await Promise.all([
            Application.find({ applicant: userId })
                .populate('job')
                .populate('job.company')
                .sort({ createdAt: -1 }),
            Job.find()
                .populate('company')
                .sort({ createdAt: -1 })
                .limit(20)
        ]);

        // Generate career advice
        const result = await generateCareerResponse(query, user, applications, jobs);

        if (!result.success) {
            if (result.isUnrelated) {
                return errorResponse(res, 400, result.message);
            } else {
                return errorResponse(res, 503, "Career Assistant temporarily unavailable");
            }
        }

        return successResponse(res, 200, "Career advice generated successfully", {
            advice: result.response,
            query
        });
    } catch (error) {
        logger.error("Career Assistant Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};

export const getSuggestedPrompts = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return errorResponse(res, 404, "User not found");
        }

        const skills = user.profile?.skills || [];
        const applications = await Application.countDocuments({ applicant: userId });

        // Generate contextual suggested prompts based on user profile
        let suggestedPrompts = [
            "How can I improve my resume?",
            "What skills should I learn for my career growth?",
            "Interview questions for technical roles",
            "How to prepare for job interviews?"
        ];

        // Customize based on user's skills
        if (skills.length > 0) {
            const primarySkill = skills[0];
            suggestedPrompts.unshift(`Interview questions for ${primarySkill} developer`);
            suggestedPrompts.unshift(`Skills I should learn for ${primarySkill} roles`);
        }

        // Customize based on application status
        if (applications > 0) {
            suggestedPrompts.unshift("How to follow up on job applications?");
            suggestedPrompts.unshift("Tips for interview preparation");
        } else {
            suggestedPrompts.unshift("How to start my job search?");
            suggestedPrompts.unshift("What should I include in my first resume?");
        }

        return successResponse(res, 200, "Suggested prompts retrieved", {
            prompts: suggestedPrompts.slice(0, 6)
        });
    } catch (error) {
        logger.error("Get Suggested Prompts Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};
