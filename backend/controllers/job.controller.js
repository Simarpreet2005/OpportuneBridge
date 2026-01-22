import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";

export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, opportunityType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || position === undefined || !companyId) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false
            })
        };

        const parsedSalary = Number(salary);
        const parsedPosition = Number(position);

        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: parsedSalary,
            location,
            jobType,
            opportunityType: opportunityType || 'Job',
            experienceLevel: experience,
            position: parsedPosition,
            company: companyId,
            created_by: userId
        });
        return res.status(201).json({
            message: "New opportunity created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.error("Job Creation Error:", error);
        return res.status(500).json({
            message: error.message || "An error occurred while posting the job.",
            success: false
        })
    }
}

export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { opportunityType: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(200).json({
                message: "No jobs found.",
                jobs: [],
                success: true
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log("getAllJobs Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
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
        console.log(error);
    }
}

export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path: 'company',
            createdAt: -1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
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
        console.error(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}