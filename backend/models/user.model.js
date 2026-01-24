import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'recruiter', 'superadmin'],
    required: true
  },
  profile: {
    bio: { type: String },
    skills: [{ type: String }],
    resume: { type: String }, // URL to resume file
    resumeOriginalName: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    profilePhoto: {
      type: String,
      default: ""
    },
    // Gamification & Verification
    gamification: {
      xp: { type: Number, default: 0 },
      rank: { type: String, default: 'Bronze' }, // Bronze, Silver, Gold, Platinum, Diamond
      badges: [{ type: String }], // 'Algorithm Master', 'Streak Survivor'
    },
    solvedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    isVerifiedSkill: { type: Boolean, default: false }, // AI-verified skills
    resumes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resume' }],
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });
export const User = mongoose.model('User', userSchema);