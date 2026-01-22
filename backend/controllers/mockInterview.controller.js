import { MockInterview } from "../models/mockInterview.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export const startMockInterview = async (req, res) => {
    try {
        const { jobRole, experience, techStack, jobDescription } = req.body;
        const userId = req.id;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "AI service not configured (API Key missing)", success: false });
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const jobDescContext = jobDescription
            ? `\n\nJob Description:\n${jobDescription}\n\nGenerate questions that are specifically relevant to this job posting.`
            : '';

        const prompt = `Generate 5 technical interview questions for a ${jobRole} role with ${experience} years of experience focusing on ${techStack}.${jobDescContext}
        Return the result as a JSON array of objects with "question" and "type" keys. Types should be either "technical", "behavioral", or "coding".
        Ensure the coding question is practical. Return ONLY the JSON.`;

        let responseText = "";
        let questions = [];
        try {
            const result = await model.generateContent(prompt);
            responseText = result.response.text();

            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error("No JSON array found in Gemini response");
            }
            questions = JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.error("Mock Interview Questions Gen Error:", e.message, "Raw:", responseText);
            return res.status(500).json({ message: "Failed to generate interview questions. Please try again.", success: false });
        }

        const mockInterview = await MockInterview.create({
            user: userId,
            jobRole,
            experience,
            techStack,
            jobDescription: jobDescription || "",
            questions: questions.map(q => ({ ...q, answer: "" })),
            status: 'in-progress'
        });

        return res.status(201).json({
            mockInterview,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to start mock interview", success: false });
    }
}

export const submitAnswers = async (req, res) => {
    try {
        const { interviewId, answers } = req.body;
        const interview = await MockInterview.findById(interviewId);

        if (!interview) {
            return res.status(404).json({ message: "Interview not found", success: false });
        }


        answers.forEach(ans => {
            if (interview.questions[ans.questionIndex]) {
                interview.questions[ans.questionIndex].answer = ans.answer;
            }
        });


        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const evaluationPrompt = `Evaluate the following interview performance strictly based on the REALITY of the provided answers. 
        Do NOT assume any knowledge or skills that the candidate has not explicitly demonstrated in their response.
        
        Rules for Evaluation:
        1. If an answer is empty, "don't know", or nonsensical, the score for that question MUST be 0-2/10.
        2. Provide honest, direct feedback. If the candidate failed to answer a technical question, specify exactly what was missing.
        3. Do NOT provide generic encouragement or assume the candidate "likely knows" the topic. 
        4. The overall score must be a realistic reflection of the average of question scores.
        
        Job Role: ${interview.jobRole}
        Tech Stack: ${interview.techStack}
        
        Q&A Pairs To Evaluate:
        ${interview.questions.map((q, i) => `Q${i + 1}: ${q.question}\nCandidate Answer: ${q.answer || "[EMPTY/NO ANSWER PROVIDED]"}`).join('\n\n')}
        
        Return the evaluation as a JSON object with this structure:
        {
          "questionEvaluations": [{"score": number, "feedback": "string"}, ...],
          "overallScore": number,
          "overallFeedback": "string"
        }
        Return ONLY the JSON.`;

        let evalText = "";
        try {
            const evalResult = await model.generateContent(evaluationPrompt);
            evalText = evalResult.response.text();

            const jsonMatch = evalText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON object found in Gemini response");
            }
            const evalData = JSON.parse(jsonMatch[0]);


            evalData.questionEvaluations.forEach((evalItem, i) => {
                if (interview.questions[i]) {
                    interview.questions[i].score = evalItem.score;
                    interview.questions[i].feedback = evalItem.feedback;
                }
            });

            interview.overallScore = evalData.overallScore;
            interview.overallFeedback = evalData.overallFeedback;
            interview.status = 'completed';
            await interview.save();

            return res.status(200).json({
                interview,
                success: true
            });
        } catch (evalError) {
            console.error("Mock Interview Evaluation Error:", evalError.message, "Raw:", evalText);
            return res.status(500).json({ message: "Failed to evaluate performance. Please try again.", success: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to evaluate interview", success: false });
    }
}

export const getMockInterviewsByUserId = async (req, res) => {
    try {
        const userId = req.id;
        const interviews = await MockInterview.find({ user: userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            interviews,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const getMockInterviewById = async (req, res) => {
    try {
        const interviewId = req.params.id;
        const interview = await MockInterview.findById(interviewId);

        return res.status(200).json({
            interview,
            success: true
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}
