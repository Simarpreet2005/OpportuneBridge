import { Resume } from "../models/resume.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export const createResume = async (req, res) => {
    try {
        const userId = req.id;
        const { title, personalInfo, education, experience, projects, skills, languages, certifications, templateId } = req.body;

        const resume = await Resume.create({
            user: userId,
            title,
            personalInfo,
            education,
            experience,
            projects,
            skills,
            languages,
            certifications,
            templateId
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
        const updateData = req.body;

        const resume = await Resume.findOneAndUpdate(
            { _id: resumeId, user: userId },
            updateData,
            { new: true }
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
        const resume = await Resume.findById(resumeId);

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

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Optimize the following resume ${section} for a ${targetJob || 'Software Engineer'} role. 
        Focus on professional language, impact-driven bullet points, and high-quality keywords.
        
        Current Content: ${content}
        
        Return only the optimized text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const optimizedText = response.text();

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

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const dataString = JSON.stringify(resumeData);
        const prompt = `Act as an ATS (Application Tracking System). Evaluate the following resume data:
        ${dataString}
        
        Provide a score from 0-100 based on completeness, keyword usage, and formatting (inferred).
        Also provide a list of missing critical sections or skills if any.
        
        Return JSON format: { "score": number, "missing": ["string"], "feedback": "string" }
        Return ONLY the JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();
        const data = JSON.parse(text);

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
