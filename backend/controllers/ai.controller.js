import { AIMatch } from "../models/aiMatch.model.js";
import { Challenge } from "../models/challenge.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export const getMatchScore = async (req, res) => {
    try {
        const userId = req.id;
        const { targetId, targetType } = req.body;

        if (!targetId || !targetType) {
            return res.status(400).json({ message: "Target ID and Type required.", success: false });
        }

        let existingMatch = await AIMatch.findOne({ user: userId, targetId, targetType });
        if (existingMatch) {
            return res.status(200).json({
                score: existingMatch.matchScore,
                analysis: existingMatch.analysis,
                success: true
            });
        }

        const user = await User.findById(userId);
        let target = null;

        if (targetType === 'Challenge') {
            target = await Challenge.findById(targetId);
        } else if (targetType === 'Job') {
            target = await Job.findById(targetId);
        }

        if (!user || !target) {
            return res.status(404).json({ message: "User or Target not found.", success: false });
        }

        let score = 0;
        let analysis = "";

        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                const prompt = `Match this user profile against the ${targetType}.
                User Skills: ${user.profile.skills.join(", ")}
                User Bio: ${user.profile.bio}
                Target Title: ${target.title}
                Target Description: ${target.description}
                ${targetType === 'Job' ? `Target Tech Stack: ${target.techStack?.join(", ")}` : ''}
                
                Provide a match score (0-100) and a brief 1-sentence analysis.
                Format: { "score": number, "analysis": "string" }`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error("No JSON object found in Gemini response");
                }
                const data = JSON.parse(jsonMatch[0]);
                score = data.score;
                analysis = data.analysis;
            } catch (err) {
                console.error("Gemini Match Error:", err.message);
                return res.status(500).json({ message: "AI evaluation failed. Please try again later.", success: false });
            }
        } else {
            return res.status(500).json({ message: "AI service not configured.", success: false });
        }

        const newMatch = await AIMatch.create({
            user: userId,
            targetType,
            targetId,
            matchScore: score,
            analysis: analysis
        });

        return res.status(200).json({
            score: newMatch.matchScore,
            analysis: newMatch.analysis,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "AI Scoring Failed", success: false });
    }
};
