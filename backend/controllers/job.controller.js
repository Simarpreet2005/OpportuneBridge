import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Resume } from "../models/resume.model.js";
import { Company } from "../models/company.model.js";
import { MatchExplanation } from "../models/matchExplanation.model.js";
import { logger } from "../utils/logger.js";
import { errorResponse } from "../utils/apiResponse.js";
import { createNotificationHelper } from "./notification.controller.js";
import { calculateJobMatchScore } from "../services/jobMatch.service.js";
import { generateJobMatchExplanation } from "../services/jobMatchExplanation.service.js";
import { generateCandidateRanking } from "../services/candidateRanking.service.js";
import { Application } from "../models/application.model.js";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const readStringQuery = (value) => (typeof value === "string" ? value : "");

const parseSalaryValue = (salary) => {
    if (salary === undefined || salary === null || salary === "") return NaN;
    if (typeof salary === "number") return Number.isFinite(salary) ? salary : NaN;
    const cleaned = String(salary).trim().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
};

export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, opportunityType, experience, position, companyId } = req.body;
        const userId = req.id;

        const reqStr = requirements !== undefined && requirements !== null ? String(requirements).trim() : "";
        const parsedSalary = parseSalaryValue(salary);
        const parsedPosition = Number(position);

        if (!title?.trim() || !description?.trim() || !reqStr || !location?.trim() || !jobType?.trim() || !experience?.trim()) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            })
        };

        if (!Number.isFinite(parsedSalary) || parsedSalary < 0) {
            return res.status(400).json({
                message: "Enter a valid salary (numeric amount, e.g. 12 or 12.5).",
                success: false
            })
        }

        if (!Number.isFinite(parsedPosition) || parsedPosition < 1) {
            return res.status(400).json({
                message: "Enter a valid number of positions (at least 1).",
                success: false
            })
        }

        if (!companyId) {
            return res.status(400).json({
                message: "Please select a company.",
                success: false
            })
        }

        const job = await Job.create({
            title: title.trim(),
            description: description.trim(),
            requirements: reqStr.split(",").map((r) => r.trim()).filter(Boolean),
            salary: parsedSalary,
            location,
            jobType,
            opportunityType: opportunityType || 'Job',
            experienceLevel: experience,
            position: parsedPosition,
            company: companyId,
            created_by: userId
        });

        // Trigger notifications for matching opportunities
        try {
            const populatedJob = await Job.findById(job._id).populate('company');
            const companyName = populatedJob.company?.name || 'Company';
            const jobReqs = job.requirements.map(r => r.toLowerCase());
            if (jobReqs.length > 0) {
                const students = await User.find({ role: 'student' });
                for (const student of students) {
                    const studentSkills = (student.profile?.skills || []).map(s => s.toLowerCase());
                    const hasMatch = studentSkills.some(s => jobReqs.some(jr => jr.includes(s) || s.includes(jr)));
                    if (hasMatch) {
                        await createNotificationHelper(
                            student._id,
                            'New Matching Opportunity',
                            `A new opportunity matching your skills was posted: ${job.title} at ${companyName}.`,
                            'info',
                            `/jobs/${job._id}`
                        );
                    }
                }
            }
        } catch (notifErr) {
            logger.error("Failed to send match notifications", { error: notifErr.message });
        }

        return res.status(201).json({
            message: "New opportunity created successfully.",
            job,
            success: true
        });
    } catch (error) {
        logger.error("Job Creation Error", { error: error.message });
        return errorResponse(res, 500, "An error occurred while posting the job.");
    }
}

export const getAllJobs = async (req, res) => {
    try {
        const keywordRaw = readStringQuery(req.query.keyword);
        const keyword = escapeRegex(keywordRaw);
        const skillsRaw = readStringQuery(req.query.skills);
        const skills = skillsRaw ? skillsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];
        const locationRaw = readStringQuery(req.query.location);
        const location = escapeRegex(locationRaw);
        const experienceRaw = readStringQuery(req.query.experience);
        const experience = escapeRegex(experienceRaw);
        const minSalaryVal = typeof req.query.minSalary === "string" ? parseFloat(req.query.minSalary) : NaN;
        const maxSalaryVal = typeof req.query.maxSalary === "string" ? parseFloat(req.query.maxSalary) : NaN;
        const minSalary = Number.isFinite(minSalaryVal) ? minSalaryVal : 0;
        const maxSalary = Number.isFinite(maxSalaryVal) ? maxSalaryVal : Infinity;
        const companyRaw = readStringQuery(req.query.company);
        const company = escapeRegex(companyRaw);
        const sortBy = readStringQuery(req.query.sortBy) || "newest";
        const pageVal = typeof req.query.page === "string" ? parseInt(req.query.page, 10) : NaN;
        const limitVal = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : NaN;
        const page = Number.isFinite(pageVal) && pageVal > 0 ? pageVal : 1;
        const limit = Number.isFinite(limitVal) && limitVal > 0 ? limitVal : 10;

        // Build base query
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { opportunityType: { $regex: keyword, $options: "i" } },
            ]
        };

        // Add filters
        if (skills.length > 0) {
            query.requirements = { $in: skills.map((s) => new RegExp(escapeRegex(s), 'i')) };
        }

        if (location) {
            query.location = { $regex: location, $options: "i" };
        }

        if (experience) {
            query.experienceLevel = { $regex: experience, $options: "i" };
        }

        if (minSalary >= 0 || maxSalary < Infinity) {
            query.salary = {};
            if (minSalary >= 0) query.salary.$gte = minSalary;
            if (maxSalary < Infinity) query.salary.$lte = maxSalary;
        }

        if (company) {
            const companies = await Company.find({ name: { $regex: company, $options: "i" } }).select('_id');
            const companyIds = companies.map(c => c._id);
            if (companyIds.length > 0) {
                query.company = { $in: companyIds };
            } else {
                // If no companies match, return empty results
                query.company = { $in: [] };
            }
        }

        // Build sort object
        let sort = {};
        switch (sortBy) {
            case 'newest':
                sort = { createdAt: -1 };
                break;
            case 'oldest':
                sort = { createdAt: 1 };
                break;
            case 'salary_high':
                sort = { salary: -1 };
                break;
            case 'salary_low':
                sort = { salary: 1 };
                break;
            case 'relevance':
                sort = { createdAt: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }

        // Get total count for pagination
        const total = await Job.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        // Get paginated results
        const jobs = await Job.find(query)
            .populate({
                path: "company"
            })
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        if (!jobs || jobs.length === 0) {
            return res.status(200).json({
                message: "No jobs found.",
                jobs: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalJobs: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                },
                success: true
            })
        };

        return res.status(200).json({
            jobs,
            pagination: {
                currentPage: page,
                totalPages,
                totalJobs: total,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            success: true
        })
    } catch (error) {
        return errorResponse(res, 500, "Internal server error", error.message);
    }
}

export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        return errorResponse(res, 500, "Internal server error");
    }
}

export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path: 'company',
            createdAt: -1
        });
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        return errorResponse(res, 500, "Internal server error");
    }
}

export const saveJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if (!user.profile) user.profile = {};
        if (!Array.isArray(user.profile.savedJobs)) user.profile.savedJobs = [];

        const isSaved = user.profile.savedJobs.includes(jobId);

        if (isSaved) {
            // Unsave
            user.profile.savedJobs = user.profile.savedJobs.filter(id => id.toString() !== jobId);
            await user.save();
            return res.status(200).json({ message: "Job removed from saved jobs", success: true, saved: false, updatedSavedJobs: user.profile.savedJobs });
        } else {
            // Save
            user.profile.savedJobs.push(jobId);
            await user.save();
            return res.status(200).json({ message: "Job saved successfully", success: true, saved: true, updatedSavedJobs: user.profile.savedJobs });
        }
    } catch (error) {
        logger.error("saveJob Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
}

export const getSavedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).populate({
            path: 'profile.savedJobs',
            populate: {
                path: 'company'
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        return res.status(200).json({
            savedJobs: user.profile.savedJobs || [],
            success: true
        });
    } catch (error) {
        logger.error("getSavedJobs Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
}

export const getJobMatchScore = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;

        const [job, user] = await Promise.all([
            Job.findById(jobId),
            User.findById(userId)
        ]);
        if (!job) return res.status(404).json({ message: "Job not found.", success: false });
        if (!user) return res.status(404).json({ message: "User not found.", success: false });

        // Get the active resume
        const resume = await Resume.findOne({ user: userId, isActive: true }).sort({ createdAt: -1 });

        const matchResult = calculateJobMatchScore(user, resume, job);

        // Check cache first
        const cachedExplanation = await MatchExplanation.findOne({ userId, jobId });
        
        let aiExplanation;
        if (cachedExplanation && cachedExplanation.matchScore === matchResult.matchScore) {
            // Use cached explanation if match score hasn't changed
            aiExplanation = cachedExplanation.explanation;
            logger.info("Using cached match explanation", { userId, jobId });
        } else {
            // Generate new explanation
            const explanationResult = await generateJobMatchExplanation(matchResult);
            aiExplanation = explanationResult.aiExplanation;

            // Cache the result
            await MatchExplanation.findOneAndUpdate(
                { userId, jobId },
                {
                    userId,
                    jobId,
                    explanation: aiExplanation,
                    matchScore: matchResult.matchScore,
                    generatedAt: new Date()
                },
                { upsert: true, new: true }
            );
        }

        return res.status(200).json({
            success: true,
            ...matchResult,
            aiExplanation
        });
    } catch (error) {
        logger.error("Job Match Score Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
}

export const getRankedCandidates = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId);
        
        if (!job) {
            return res.status(404).json({ message: "Job not found", success: false });
        }

        const applications = await Application.find({ job: jobId }).populate({
            path: 'applicant',
            populate: {
                path: 'profile.resumes'
            }
        });

        if (!applications || applications.length === 0) {
            return res.status(200).json({ success: true, rankedCandidates: [] });
        }

        const rankedPromises = applications.map(async (app) => {
            const candidate = app.applicant;
            const rankingInfo = await generateCandidateRanking(candidate, job);
            return rankingInfo;
        });

        let rankedCandidates = await Promise.all(rankedPromises);

        // Sort descending by score
        rankedCandidates.sort((a, b) => b.score - a.score);

        // Add rank field
        rankedCandidates = rankedCandidates.map((candidate, index) => ({
            rank: index + 1,
            ...candidate
        }));

        return res.status(200).json({
            success: true,
            rankedCandidates
        });
    } catch (error) {
        logger.error("getRankedCandidates Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
}
