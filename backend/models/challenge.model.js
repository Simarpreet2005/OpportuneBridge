import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    techStack: [{
        type: String
    }],
    boilerplateCode: {
        python: { type: String, default: "" },
        javascript: { type: String, default: "" },
        java: { type: String, default: "" },
        cpp: { type: String, default: "" }
    },
    testCases: [{
        input: { type: String, required: true },
        output: { type: String, required: true },
        isHidden: { type: Boolean, default: false }
    }],
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

export const Challenge = mongoose.model('Challenge', challengeSchema);
