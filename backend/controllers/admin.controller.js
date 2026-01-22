import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";

export const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
        const totalJobs = await Job.countDocuments();
        const totalCompanies = await Company.countDocuments();
        const totalApplications = await Application.countDocuments();

        // Recent Activity
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('fullname email role createdAt');
        const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5).select('title company createdAt').populate('company', 'name');

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalStudents,
                totalRecruiters,
                totalJobs,
                totalCompanies,
                totalApplications
            },
            recentActivity: {
                users: recentUsers,
                jobs: recentJobs
            }
        });
    } catch (error) {
        console.error("System Stats Error:", error);
        return res.status(500).json({ message: "Failed to fetch system stats", success: false });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, users });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch users", success: false });
    }
}

export const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, companies });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch companies", success: false });
    }
}
