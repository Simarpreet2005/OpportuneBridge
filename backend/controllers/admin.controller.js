import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { errorResponse } from "../utils/apiResponse.js";

// Helper function to get common statistics
const getCommonStats = async () => {
    const [
        totalUsers,
        totalStudents,
        totalRecruiters,
        totalJobs,
        totalCompanies,
        totalApplications
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'recruiter' }),
        Job.countDocuments(),
        Company.countDocuments(),
        Application.countDocuments()
    ]);

    return {
        totalUsers,
        totalStudents,
        totalRecruiters,
        totalJobs,
        totalCompanies,
        totalApplications
    };
};

// Helper function to get recent activity
const getRecentActivity = async (limit = 10) => {
    const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('fullname email role createdAt');

    const recentJobs = await Job.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('company', 'name');

    return { recentUsers, recentJobs };
};

export const getDashboardStats = async (req, res) => {
    try {
        const stats = await getCommonStats();
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const { recentUsers, recentJobs } = await getRecentActivity(10);

        return res.status(200).json({
            stats: {
                ...stats,
                totalAdmins
            },
            recentUsers,
            recentJobs,
            success: true
        });
    } catch (error) {
        logger.error("Admin Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};

export const getSystemStats = async (req, res) => {
    try {
        const stats = await getCommonStats();
        const { recentUsers, recentJobs } = await getRecentActivity(5);

        return res.status(200).json({
            success: true,
            stats,
            recentActivity: {
                users: recentUsers,
                jobs: recentJobs
            }
        });
    } catch (error) {
        logger.error("Admin Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('-password')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            users,
            success: true
        });
    } catch (error) {
        logger.error("Admin Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: "Cannot delete admin", success: false });
        }

        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            message: "User deleted successfully",
            success: true
        });
    } catch (error) {
        logger.error("Admin Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};

export const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find()
            .populate('userId', 'fullname email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            companies,
            success: true
        });
    } catch (error) {
        logger.error("Admin Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};

export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('company', 'name')
            .populate('created_by', 'fullname email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            jobs,
            success: true
        });
    } catch (error) {
        logger.error("Admin Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};

export const deleteCompany = async (req, res) => {
    try {
        const { companyId } = req.params;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found", success: false });
        }

        let session;
        try {
            session = await mongoose.startSession();
            await session.withTransaction(async () => {
                const jobs = await Job.find({ company: companyId }).select("_id").session(session);
                const jobIds = jobs.map((j) => j._id);
                if (jobIds.length > 0) {
                    await Application.deleteMany({ job: { $in: jobIds } }).session(session);
                }
                await Job.deleteMany({ company: companyId }).session(session);
                await Company.findByIdAndDelete(companyId).session(session);
            });
        } catch (txError) {
            const jobs = await Job.find({ company: companyId }).select("_id");
            const jobIds = jobs.map((j) => j._id);
            if (jobIds.length > 0) {
                await Application.deleteMany({ job: { $in: jobIds } });
            }
            await Job.deleteMany({ company: companyId });
            await Company.findByIdAndDelete(companyId);
        } finally {
            if (session) session.endSession();
        }

        return res.status(200).json({
            message: "Company and associated jobs deleted successfully",
            success: true
        });
    } catch (error) {
        logger.error("Admin Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};

export const deleteJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found", success: false });
        }

        let session;
        try {
            session = await mongoose.startSession();
            await session.withTransaction(async () => {
                await Application.deleteMany({ job: jobId }).session(session);
                await Job.findByIdAndDelete(jobId).session(session);
            });
        } catch (txError) {
            await Application.deleteMany({ job: jobId });
            await Job.findByIdAndDelete(jobId);
        } finally {
            if (session) session.endSession();
        }

        return res.status(200).json({
            message: "Job and associated applications deleted successfully",
            success: true
        });
    } catch (error) {
        logger.error("Admin Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};

export const suspendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { suspend } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: "Cannot suspend admin", success: false });
        }

        user.isSuspended = suspend;
        await user.save();

        return res.status(200).json({
            message: suspend ? "User suspended successfully" : "User unsuspended successfully",
            success: true
        });
    } catch (error) {
        logger.error("Admin Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};

export const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('applicant', 'fullname email')
            .populate('job', 'title')
            .populate({
                path: 'job',
                populate: {
                    path: 'company',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            applications,
            success: true
        });
    } catch (error) {
        logger.error("Admin Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};

export const deleteApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found", success: false });
        }

        await Application.findByIdAndDelete(applicationId);

        return res.status(200).json({
            message: "Application deleted successfully",
            success: true
        });
    } catch (error) {
        logger.error("Admin Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};
