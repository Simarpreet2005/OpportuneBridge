import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
        const totalJobs = await Job.countDocuments();
        const totalCompanies = await Company.countDocuments();
        const totalApplications = await Application.countDocuments();

        // Recent users
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('fullname email role createdAt');

        // Recent jobs
        const recentJobs = await Job.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('company', 'name');

        return res.status(200).json({
            stats: {
                totalUsers,
                totalStudents,
                totalRecruiters,
                totalJobs,
                totalCompanies,
                totalApplications
            },
            recentUsers,
            recentJobs,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'superadmin' } })
            .select('-password')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            users,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if (user.role === 'superadmin') {
            return res.status(403).json({ message: "Cannot delete super admin", success: false });
        }

        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            message: "User deleted successfully",
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
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
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
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
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};
