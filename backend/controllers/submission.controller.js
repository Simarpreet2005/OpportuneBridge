import { Submission } from "../models/submission.model.js";
import { Challenge } from "../models/challenge.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export const submitCode = async (req, res) => {
    try {
        const { challengeId, code, language } = req.body;
        const userId = req.id; // From isAuthenticated middleware

        if (!challengeId || !code || !language) {
            return res.status(400).json({ message: "All fields are required.", success: false });
        }

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found.", success: false });
        }

        // 1. Initial creation of submission record
        const submission = await Submission.create({
            user: userId,
            challenge: challengeId,
            code,
            language,
            status: 'Pending'
        });

        // 2. AI Evaluation Logic
        let aiFeedback = "";
        let status = "Pending";

        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                const prompt = `Evaluate the following code submission for the challenge: "${challenge.title}".
                
                Challenge Description: ${challenge.description}
                Target Tech Stack: ${challenge.techStack?.join(", ")}
                
                Submitted Code (${language}):
                ${code}
                
                Task:
                1. Check if the code logically solves the problem described.
                2. Evaluate code quality and optimization.
                3. Provide a status: "Passed" if it works and is efficient, "Failed" if there are major logic errors or if it's completely wrong.
                4. Provide detailed constructive feedback.
                
                Return the evaluation as a JSON object:
                {
                  "status": "Passed" | "Failed",
                  "feedback": "string (markdown allowed)"
                }
                Return ONLY the JSON.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const data = JSON.parse(jsonMatch[0]);
                    status = data.status || "Pending";
                    aiFeedback = data.feedback || "Logic evaluation complete.";
                } else {
                    aiFeedback = "AI evaluation completed but format was unexpected.";
                }
            } catch (err) {
                console.error("AI Submission Evaluation Error:", err.message);
                aiFeedback = "AI evaluation failed due to a technical error.";
            }
        } else {
            aiFeedback = "AI service not configured for evaluation.";
        }

        // 3. Update submission with AI results
        submission.status = status;
        submission.aiFeedback = aiFeedback;
        await submission.save();

        return res.status(201).json({
            message: "Code submitted and evaluated successfully.",
            submission,
            success: true
        });

    } catch (error) {
        console.error("Submission Controller Error:", error);
        return res.status(500).json({ message: "Failed to process submission", success: false });
    }
};

export const getSubmissionsForChallenge = async (req, res) => {
    try {
        const userId = req.id;
        const { challengeId } = req.params;

        const submissions = await Submission.find({ user: userId, challenge: challengeId }).sort({ createdAt: -1 });

        return res.status(200).json({
            submissions,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getAllUserSubmissions = async (req, res) => {
    try {
        const userId = req.id;
        const submissions = await Submission.find({ user: userId })
            .populate('challenge', 'title')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            submissions,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};
