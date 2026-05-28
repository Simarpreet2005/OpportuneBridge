import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Job } from "./models/job.model.js";
import { Application } from "./models/application.model.js";
import { logger } from "./utils/logger.js";

dotenv.config({ override: true });

const SEED_EMAIL_DOMAIN = "seed.opportunebridge.local";
const SEED_EMAIL_PATTERN = `@${SEED_EMAIL_DOMAIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`;

const seedCompanyNames = [
    "Northstar Cloud Systems",
    "LedgerPeak Finance",
    "Evergreen HealthTech",
    "Arcbyte Analytics",
    "Harbor Retail Labs",
    "Switchboard Mobility",
    "BrightHire Studio",
    "CipherNest Security",
    "GreenGrid Energy",
    "PixelForge Product Co.",
    "RelayWorks Logistics",
    "Mosaic Learning Labs"
];

const clearSeedData = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined");
        }

        await mongoose.connect(process.env.MONGO_URI);
        logger.info("Connected to database for clearing seed data");

        // 1. Find seed users
        const seedUsers = await User.find({
            email: { $regex: SEED_EMAIL_PATTERN }
        }).select("_id");
        const seedUserIds = seedUsers.map((user) => user._id);

        // 2. Find seed companies
        const seedCompanies = await Company.find({
            $or: [
                { name: { $in: seedCompanyNames } },
                ...(seedUserIds.length ? [{ userId: { $in: seedUserIds } }] : [])
            ]
        }).select("_id");
        const seedCompanyIds = seedCompanies.map((company) => company._id);

        // 3. Find seed jobs
        const jobDeleteFilter = {
            $or: [
                ...(seedUserIds.length ? [{ created_by: { $in: seedUserIds } }] : []),
                ...(seedCompanyIds.length ? [{ company: { $in: seedCompanyIds } }] : [])
            ]
        };
        
        let deletedApplicationsCount = 0;
        let deletedJobsCount = 0;

        if (jobDeleteFilter.$or.length) {
            const seedJobs = await Job.find(jobDeleteFilter).select("_id");
            const seedJobIds = seedJobs.map((job) => job._id);
            
            // Delete applications for those jobs
            if (seedJobIds.length) {
                const deletedApps = await Application.deleteMany({ job: { $in: seedJobIds } });
                deletedApplicationsCount = deletedApps.deletedCount;
            }

            // Delete jobs
            const deletedJobs = await Job.deleteMany(jobDeleteFilter);
            deletedJobsCount = deletedJobs.deletedCount;
        }

        // 4. Delete companies and users
        const deletedCompanies = await Company.deleteMany({ _id: { $in: seedCompanyIds } });
        const deletedUsers = await User.deleteMany({ _id: { $in: seedUserIds } });

        logger.info("Cleared seed data successfully", {
            applications: deletedApplicationsCount,
            jobs: deletedJobsCount,
            companies: deletedCompanies.deletedCount,
            users: deletedUsers.deletedCount
        });

    } catch (error) {
        logger.error("Failed to clear seed data", { message: error.message });
    } finally {
        await mongoose.disconnect();
        logger.info("Disconnected from database");
    }
};

clearSeedData();
