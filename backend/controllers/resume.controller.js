import { Resume } from "../models/resume.model.js";
import { generateGeminiText, parseGeminiJson } from "../utils/gemini.js";

const resumeFields = [
    "title",
    "personalInfo",
    "education",
    "experience",
    "projects",
    "skills",
    "languages",
    "certifications",
    "templateId",
    "isPublic",
    "publicSlug"
];

const pickResumeData = (body = {}) => {
    return resumeFields.reduce((acc, field) => {
        if (body[field] !== undefined) {
            acc[field] = body[field];
        }
        return acc;
    }, {});
};

export const createResume = async (req, res) => {
    try {
        const userId = req.id;
        const resumeData = pickResumeData(req.body);

        const resume = await Resume.create({
            user: userId,
            ...resumeData
        });

        return res.status(201).json({
            message: "Resume created successfully.",
            resume,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const updateResume = async (req, res) => {
    try {
        const resumeId = req.params.id;
        const userId = req.id;
        const updateData = pickResumeData(req.body);

        const resume = await Resume.findOneAndUpdate(
            { _id: resumeId, user: userId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!resume) {
            return res.status(404).json({ message: "Resume not found", success: false });
        }

        return res.status(200).json({
            message: "Resume updated successfully.",
            resume,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const getResumes = async (req, res) => {
    try {
        const userId = req.id;
        const resumes = await Resume.find({ user: userId }).sort({ updatedAt: -1 });

        return res.status(200).json({
            resumes,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const getResumeById = async (req, res) => {
    try {
        const resumeId = req.params.id;
        const userId = req.id;
        const resume = await Resume.findOne({ _id: resumeId, user: userId });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found", success: false });
        }

        return res.status(200).json({
            resume,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const deleteResume = async (req, res) => {
    try {
        const resumeId = req.params.id;
        const userId = req.id;

        const resume = await Resume.findOneAndDelete({ _id: resumeId, user: userId });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found", success: false });
        }

        return res.status(200).json({
            message: "Resume deleted successfully.",
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const optimizeResumeAI = async (req, res) => {
    try {
        const { section, content, targetJob } = req.body;

        const prompt = `Optimize the following resume ${section} for a ${targetJob || 'Software Engineer'} role. 
        Focus on professional language, impact-driven bullet points, and high-quality keywords.
        
        Current Content: ${content}
        
        Return only the optimized text.`;

        const optimizedText = await generateGeminiText(prompt);

        return res.status(200).json({
            optimizedText,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "AI Optimization failed", success: false });
    }
}

export const calculateATSScore = async (req, res) => {
    try {
        const { resumeData } = req.body;

        const dataString = JSON.stringify(resumeData);
        const prompt = `Act as an ATS (Application Tracking System). Evaluate the following resume data:
        ${dataString}
        
        Provide a score from 0-100 based on completeness, keyword usage, and formatting (inferred).
        Also provide a list of missing critical sections or skills if any.
        
        Return JSON format: { "score": number, "missing": ["string"], "feedback": "string" }
        Return ONLY the JSON.`;

        const text = await generateGeminiText(prompt);
        const data = parseGeminiJson(text);

        return res.status(200).json({
            score: data.score,
            missing: data.missing,
            feedback: data.feedback,
            success: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "ATS Calculation failed", success: false });
    }
}
