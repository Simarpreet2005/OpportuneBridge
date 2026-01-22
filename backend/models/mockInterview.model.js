import mongoose from "mongoose";

const mockInterviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobRole: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    techStack: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        default: ""
    },
    questions: [{
        question: String,
        type: { type: String, enum: ['technical', 'behavioral', 'coding'] },
        answer: String,
        score: Number,
        feedback: String
    }],
    overallScore: {
        type: Number
    },
    overallFeedback: {
        type: String
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed'],
        default: 'in-progress'
    }
}, { timestamps: true });

export const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);
