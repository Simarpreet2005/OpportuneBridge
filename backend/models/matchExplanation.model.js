import mongoose from "mongoose";

const matchExplanationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        index: true
    },
    explanation: {
        type: String,
        required: true
    },
    matchScore: {
        type: Number,
        required: true
    },
    generatedAt: {
        type: Date,
        default: Date.now,
        index: { expires: 604800 } // TTL: 7 days
    }
}, {
    timestamps: true
});

// Compound index for efficient lookups
matchExplanationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const MatchExplanation = mongoose.model('MatchExplanation', matchExplanationSchema);
