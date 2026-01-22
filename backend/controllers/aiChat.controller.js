import { GoogleGenerativeAI } from "@google/generative-ai";
import { User } from "../models/user.model.js";

export function buildPrompt(userInput) {
    return `
You are a job market expert.

Rules:
- Never ask clarifying questions.
- If info is missing, assume:
  Location = India
  Industry = Tech
  Level = Entry to Mid
- Give specific, actionable answers in table format.

User request:
${userInput}
`;
}

export const aiChatbot = async (req, res) => {
    try {
        const { message, history } = req.body;
        const userId = req.id;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Gemini API Key missing", success: false });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const chat = model.startChat({
            history: history || [],
        });

        const prompt = buildPrompt(message);
        const result = await chat.sendMessage(prompt);
        let reply = result.response.text();

        if (reply.includes("```")) {
            reply = reply.replace(/```(json)?|```/g, "").trim();
        }

        return res.status(200).json({
            success: true,
            reply
        });

    } catch (error) {
        console.error("AI Chatbot Error:", error.message);
        return res.status(500).json({ message: "AI Service Error", success: false });
    }
}

export const getATSScore = async (req, res) => {
    try {
        const { resumeText, jobDescription } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Gemini API Key missing", success: false });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        Act as an expert Applicant Tracking System (ATS).
        Compare the following Resume Text and Job Description.
        
        Resume: ${resumeText}
        
        Job Description: ${jobDescription}
        
        Provide a compatibility score (0-100) and a brief justification.
        Return ONLY a JSON object:
        {
            "score": <number>,
            "justification": "<string>"
        }
        `;

        let text = "";
        try {
            const result = await model.generateContent(prompt);
            text = result.response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON object found in Gemini response");
            }
            const data = JSON.parse(jsonMatch[0]);

            return res.status(200).json({
                success: true,
                score: data.score,
                justification: data.justification
            });
        } catch (parseError) {
            console.error("ATS Parsing/Generation Error:", parseError.message, "Raw Text:", text);
            return res.status(500).json({ message: "ATS Analysis failed to process. Try again.", success: false });
        }

    } catch (error) {
        console.error("ATS Error:", error);
        return res.status(500).json({ message: "ATS Analysis Failed", success: false });
    }
}
