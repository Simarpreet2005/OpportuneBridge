import Groq from 'groq-sdk';
import { logger } from "../utils/logger.js";

// Valid career-related keywords to filter out unrelated questions
const CAREER_KEYWORDS = [
    'resume', 'cv', 'curriculum', 'skill', 'skills', 'experience', 'job', 'career', 'interview',
    'application', 'apply', 'recruiter', 'company', 'position', 'role', 'developer', 'engineer',
    'backend', 'frontend', 'fullstack', 'react', 'node', 'javascript', 'python', 'java', 'learn',
    'improve', 'missing', 'gap', 'prepare', 'question', 'answer', 'salary', 'negotiate',
    'portfolio', 'project', 'github', 'linkedin', 'network', 'offer', 'reject', 'shortlist'
];

export const isCareerRelated = (query) => {
    const lowerQuery = query.toLowerCase();
    return CAREER_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
};

export const buildCareerPrompt = (user, query, applications = [], jobs = []) => {
    const userProfile = {
        name: user.fullname,
        email: user.email,
        role: user.role,
        skills: user.profile?.skills || [],
        bio: user.profile?.bio || '',
        resume: user.profile?.resume ? 'Resume uploaded' : 'No resume',
        applicationsCount: applications.length,
        appliedJobs: applications.map(app => ({
            title: app.job?.title,
            company: app.job?.company?.name,
            status: app.status
        }))
    };

    const systemPrompt = `You are a Career Assistant for OpportuneBridge, a job platform. 
Your purpose is to help users with career guidance, resume improvement, skill development, and interview preparation.
You should ONLY answer questions related to careers, jobs, skills, resumes, interviews, and professional development.
If a question is unrelated to career topics, politely decline and redirect to career-related topics.

User Profile:
- Name: ${userProfile.name}
- Role: ${userProfile.role}
- Skills: ${userProfile.skills.join(', ') || 'Not specified'}
- Bio: ${userProfile.bio}
- Resume: ${userProfile.resume}
- Applications: ${userProfile.applicationsCount}
- Applied Jobs: ${userProfile.appliedJobs.map(j => `${j.title} at ${j.company} (${j.status})`).join(', ') || 'None'}

Recent Job Listings:
${jobs.slice(0, 5).map(job => `- ${job.title} at ${job.company?.name}: ${job.requirements}`).join('\n')}

Guidelines:
1. Provide specific, actionable advice based on the user's profile
2. Suggest skills they should learn based on job requirements
3. Help improve their resume with specific suggestions
4. Prepare them for interviews with relevant questions
5. Keep responses concise and practical
6. If the question is unrelated to careers, politely decline and suggest career-related topics they can ask about.

User Query: ${query}`;

    return systemPrompt;
};

export const generateCareerResponse = async (query, user, applications, jobs) => {
    try {
        // Validate query is career-related
        if (!isCareerRelated(query)) {
            return {
                success: false,
                isUnrelated: true,
                message: "I can only help with career-related questions such as resume improvement, skill development, interview preparation, and job search guidance. Please ask a career-related question."
            };
        }

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
            logger.error("GROQ_API_KEY is not defined or is using placeholder value");
            return {
                success: false,
                message: "Career Assistant is not configured. Please contact support."
            };
        }

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        const prompt = buildCareerPrompt(user, query, applications, jobs);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a professional Career Assistant for OpportuneBridge. Provide clear, structured, and helpful career guidance. Keep responses relatively concise and focused solely on professional advice. If the user's query is not related to career topics, decline politely."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 1024
        });

        const content = chatCompletion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Empty response from Groq API");
        }

        return {
            success: true,
            response: {
                type: "career",
                content: content.trim()
            }
        };
    } catch (error) {
        logger.error("Career Assistant Groq Error", { error: error.message, stack: error.stack });
        return {
            success: false,
            message: error.message.includes('API key') ? "Career Assistant is not configured. Please contact support." : "Career Assistant temporarily unavailable. Please try again later."
        };
    }
};
