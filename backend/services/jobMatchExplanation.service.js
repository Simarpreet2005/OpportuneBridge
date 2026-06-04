import Groq from 'groq-sdk';
import Bottleneck from 'bottleneck';
import { logger } from "../utils/logger.js";

// Rate limiter for Groq API - 1 request every 1.2 seconds, max 1 concurrent
const limiter = new Bottleneck({
    minTime: 1200,
    maxConcurrent: 1,
});

// Retry with exponential backoff
async function retryWithBackoff(fn, retries = 3) {
    try {
        return await fn();
    } catch (err) {
        if (retries === 0) throw err;
        const delay = (4 - retries) * 2000;
        logger.info(`Retrying Groq API call in ${delay}ms...`, { retriesLeft: retries });
        await new Promise(res => setTimeout(res, delay));
        return retryWithBackoff(fn, retries - 1);
    }
}

// Wrap Groq call with rate limiter
const limitedGroqCall = limiter.wrap(async (payload) => {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });
    return await groq.chat.completions.create(payload);
});

export const generateJobMatchExplanation = async (matchData) => {
    try {
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
            logger.error("GROQ_API_KEY is not defined or is using placeholder value");
            return {
                success: true,
                aiExplanation: "Career insights unavailable - AI service not configured."
            };
        }

        const prompt = `Job Match Score: ${matchData.matchScore}
Matched: ${matchData.matchedSkills?.slice(0, 5).join(', ') || 'None'}
Missing: ${matchData.missingSkills?.slice(0, 3).join(', ') || 'None'}

Provide 3 concise bullet points: strengths, gaps, next steps.`;

        const response = await retryWithBackoff(async () => {
            return await limitedGroqCall({
                messages: [
                    {
                        role: "system",
                        content: "Career assistant. Provide 3 concise bullet points only. No numbers or scores."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.3,
                max_tokens: 150
            });
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Empty response from Groq API");
        }

        return {
            success: true,
            aiExplanation: content.trim()
        };
    } catch (error) {
        if (error.status === 401) {
            logger.warn("Job Match Explanation Error", { error: error.message });
        } else {
            logger.error("Job Match Explanation Error", { error: error.message, stack: error.stack });
        }
        return {
            success: true,
            aiExplanation: "Career insights temporarily unavailable. Please try again later."
        };
    }
};
