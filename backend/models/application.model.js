import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        required: true
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    changedAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ""
    }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resumeVersionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ResumeVersion'
    },
    status: {
        type: String,
        enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'],
        default: 'Applied'
    },
    statusHistory: [statusHistorySchema],
    interviewDetails: {
        scheduledDate: Date,
        scheduledTime: String,
        interviewType: {
            type: String,
            enum: ['In-Person', 'Video Call', 'Phone Screen'],
            default: 'Video Call'
        },
        location: String,
        meetingLink: String
    },
    rejectionReason: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export const Application = mongoose.model("Application", applicationSchema);