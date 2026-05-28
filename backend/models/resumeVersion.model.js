import mongoose from "mongoose";

const resumeVersionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    version: {
        type: Number,
        required: true
    },
    resumeUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    skillsExtracted: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: false
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

resumeVersionSchema.index({ userId: 1, version: 1 });
resumeVersionSchema.index({ userId: 1, isActive: 1 });

export const ResumeVersion = mongoose.model("ResumeVersion", resumeVersionSchema);
