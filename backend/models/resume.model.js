import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    title: {
      type: String,
      default: "My Resume",
      trim: true
    },

    version: {
      type: Number,
      default: 1
    },

    isActive: {
      type: Boolean,
      default: true
    },

    fileUrl: {
      type: String,
      default: ""
    },

    originalFileName: {
      type: String,
      default: ""
    },

    aiAnalysis: {
      atsScore: {
        type: Number,
        default: 0
      },

      matchedSkills: [
        {
          type: String
        }
      ],

      missingSkills: [
        {
          type: String
        }
      ],

      semanticMatchScore: {
        type: Number,
        default: 0
      },

      lastScannedAt: {
        type: Date
      }
    },

    jobMatches: [
      {
        jobId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Job"
        },

        matchScore: Number,
        scannedAt: Date
      }
    ],

    personalInfo: {
      fullName: String,
      email: String,
      phoneNumber: String,
      address: String,
      summary: String,
      profilePhoto: String
    },

    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startDate: String,
        endDate: String,
        description: String
      }
    ],

    experience: [
      {
        company: String,
        role: String,
        location: String,
        startDate: String,
        endDate: String,
        description: String,
        isCurrent: {
          type: Boolean,
          default: false
        }
      }
    ],

    projects: [
      {
        title: String,
        description: String,
        link: String,
        technologies: [String]
      }
    ],

    skills: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],

    languages: [String],

    certifications: [
      {
        name: String,
        issuer: String,
        year: String
      }
    ],

    templateId: {
      type: String,
      default: "modern"
    },

    isPublic: {
      type: Boolean,
      default: false
    },

    publicSlug: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, isActive: 1 });
resumeSchema.index({ "aiAnalysis.atsScore": -1 });

export const Resume = mongoose.model("Resume", resumeSchema);
