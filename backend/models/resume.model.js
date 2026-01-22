import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        default: "My Resume"
    },
    fileUrl: {
        type: String, // URL for uploaded resume PDF
        default: ""
    },
    personalInfo: {
        fullName: { type: String },
        email: { type: String },
        phoneNumber: { type: String },
        address: { type: String },
        summary: { type: String },
        profilePhoto: { type: String },
    },
    education: [{
        institution: { type: String },
        degree: { type: String },
        fieldOfStudy: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        description: { type: String },
    }],
    experience: [{
        company: { type: String },
        role: { type: String },
        location: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        description: { type: String },
        isCurrent: { type: Boolean, default: false }
    }],
    projects: [{
        title: { type: String },
        description: { type: String },
        link: { type: String },
        technologies: [{ type: String }]
    }],
    skills: [{ type: String }],
    languages: [{ type: String }],
    certifications: [{
        name: { type: String },
        issuer: { type: String },
        year: { type: String }
    }],
    templateId: {
        type: String,
        default: "modern"
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Resume = mongoose.model('Resume', resumeSchema);
