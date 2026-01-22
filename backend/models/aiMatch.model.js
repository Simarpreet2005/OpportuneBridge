import mongoose from "mongoose";

const aiMatchSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetType: {
        type: String,
        enum: ['Job', 'Challenge'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetType' 
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    analysis: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export const AIMatch = mongoose.model('AIMatch', aiMatchSchema);
