import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Passed', 'Failed'],
        default: 'Pending'
    },
    executionTime: { type: Number }, 
    memoryUsage: { type: Number }, 
    aiFeedback: {
        type: String,
        default: "" 
    }
}, { timestamps: true });

export const Submission = mongoose.model('Submission', submissionSchema);
