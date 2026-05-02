import { generateGeminiText, parseGeminiJson, sendGeminiChat } from "../utils/gemini.js";

export function buildPrompt(userInput) {
    return `You are Career AI, the in-app assistant for OpportuneBridge.

Answer the user's exact message first. Be useful for jobs, resumes, interviews, applications, skills, salary, hiring, and platform guidance.

Response rules:
- Stay relevant to the user's question. Do not force a table unless comparison data genuinely helps.
- If the user asks for resume help, give concrete wording or bullet improvements.
- If the user asks for interview help, include sample answers or practice questions.
- If the user asks for job search help, include practical next steps.
- If the user asks something outside careers, answer briefly when safe, then connect back only if helpful.
- Keep replies concise, friendly, and actionable.
- Use India/tech/entry-to-mid level assumptions only when the user leaves those details out and they matter.

User message: ${userInput}`;
}

export const aiChatbot = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({ message: "Message is required", success: false });
        }

        const prompt = buildPrompt(message);
        let reply = await sendGeminiChat({
            message: prompt,
            history: history || []
        });

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

        if (!resumeText || !jobDescription) {
            return res.status(400).json({ message: "Resume text and job description are required", success: false });
        }

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
            text = await generateGeminiText(prompt);
            const data = parseGeminiJson(text);

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
