import { Application } from "../models/application.model.js";
import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { errorResponse } from "../utils/apiResponse.js";
import { Job } from "../models/job.model.js";
import { createNotificationHelper } from "./notification.controller.js";
import { getActiveResumeVersion } from "../services/resumeVersion.service.js";

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        const { resumeVersionId } = req.body;
        
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            })
        };

        const [existingApplication, job] = await Promise.all([
            Application.findOne({ job: jobId, applicant: userId }),
            Job.findById(jobId).populate('company')
        ]);

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        }

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }

        // Get resume version ID - either from request or active version
        let finalResumeVersionId = resumeVersionId;
        if (!finalResumeVersionId) {
            const activeResumeVersion = await getActiveResumeVersion(userId);
            if (activeResumeVersion) {
                finalResumeVersionId = activeResumeVersion._id;
            }
        }

        const applicationData = {
            job: jobId,
            applicant: userId,
            resumeVersionId: finalResumeVersionId,
            status: 'Applied',
            statusHistory: [{
                status: 'Applied',
                changedBy: userId,
                changedAt: new Date(),
                notes: 'Application submitted'
            }]
        };

        let newApplication;
        let session;
        try {
            session = await mongoose.startSession();
            await session.withTransaction(async () => {
                const created = await Application.create([applicationData], { session });
                newApplication = created[0];
                await Job.updateOne(
                    { _id: jobId },
                    { $push: { applications: newApplication._id } },
                    { session }
                );
            });
        } catch (txError) {
            newApplication = await Application.create(applicationData);
            await Job.updateOne(
                { _id: jobId },
                { $push: { applications: newApplication._id } }
            );
        } finally {
            if (session) session.endSession();
        }

        const companyName = job.company?.name || 'Company';
        await createNotificationHelper(userId, 'Application Submitted', `You have successfully applied for the position of ${job.title} at ${companyName}.`, 'success');
        await createNotificationHelper(job.created_by, 'New Application Received', `A new candidate has applied for your job posting: ${job.title}.`, 'info');

        return res.status(201).json({
            message: "Job applied successfully.",
            success: true
        })
    } catch (error) {
        return errorResponse(res, 500, "Internal server error");
    }
};
export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const application = await Application.find({ applicant: userId }).sort({ createdAt: -1 }).populate({
            path: 'job',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'company',
                options: { sort: { createdAt: -1 } },
            }
        });
        return res.status(200).json({
            application,
            success: true
        })
    } catch (error) {
        return errorResponse(res, 500, "Internal server error");;
    }
}

export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const { skills, status, search, sortBy } = req.query;

        const job = await Job.findById(jobId).populate({
            path: 'applications',
            populate: {
                path: 'applicant',
                populate: {
                    path: 'profile.resumes'
                }
            }
        });

        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            });
        }

        const requesterRole = req.user?.role;
        if (requesterRole === "recruiter" && job.created_by?.toString() !== req.id) {
            return res.status(403).json({
                message: "Access denied.",
                success: false
            });
        }

        let filteredApplications = job.applications || [];

        // Filter by status
        if (status) {
            filteredApplications = filteredApplications.filter(app => 
                app.status?.toLowerCase() === status.toLowerCase()
            );
        }

        // Filter by search (name or email)
        if (search) {
            const queryLower = search.toLowerCase();
            filteredApplications = filteredApplications.filter(app => 
                app.applicant && (
                    app.applicant.fullname?.toLowerCase().includes(queryLower) ||
                    app.applicant.email?.toLowerCase().includes(queryLower)
                )
            );
        }

        // Filter by skills
        if (skills) {
            const skillQuery = skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
            if (skillQuery.length > 0) {
                filteredApplications = filteredApplications.filter(app => {
                    if (!app.applicant || !app.applicant.profile?.skills) return false;
                    const applicantSkills = app.applicant.profile.skills.map(s => s.toLowerCase());
                    return skillQuery.some(sq => applicantSkills.some(as => as.includes(sq)));
                });
            }
        }

        // Sort applications
        if (sortBy === 'oldest') {
            filteredApplications.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
            filteredApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const responseJob = job.toObject();
        responseJob.applications = filteredApplications;

        return res.status(200).json({
            job: responseJob,
            success: true
        });
    } catch (error) {
        logger.error("getApplicants Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
}
export const updateStatus = async (req, res) => {
    try {
        const { status, notes, interviewDetails, rejectionReason } = req.body;
        const applicationId = req.params.id;
        const userId = req.id;

        if (!status) {
            return res.status(400).json({
                message: 'status is required',
                success: false
            })
        }

        const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status',
                success: false
            })
        }

        const application = await Application.findById(applicationId).populate({
            path: 'job',
            populate: {
                path: 'company'
            }
        });
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            })
        }

        const requesterRole = req.user?.role;
        const jobOwnerId = application.job?.created_by?.toString();
        if (requesterRole === "recruiter" && jobOwnerId && jobOwnerId !== userId) {
            return res.status(403).json({
                message: "Access denied.",
                success: false
            });
        }

        // Add status history entry
        application.statusHistory.push({
            status: status,
            changedBy: userId,
            changedAt: new Date(),
            notes: notes || `Status changed to ${status}`
        });

        // Update status
        application.status = status;

        // Handle interview details if status is Interview Scheduled
        if (status === 'Interview Scheduled' && interviewDetails) {
            application.interviewDetails = interviewDetails;
        }

        // Handle rejection reason if status is Rejected
        if (status === 'Rejected' && rejectionReason) {
            application.rejectionReason = rejectionReason;
        }

        await application.save();

        // Create notification for student
        if (application) {
            const jobTitle = application.job?.title || 'Job';
            const companyName = application.job?.company?.name || 'Company';
            let title = 'Application Update';
            let message = `The status of your application for ${jobTitle} at ${companyName} has been updated to ${status}.`;
            let type = 'info';

            if (status === 'Shortlisted') {
                title = 'Application Shortlisted';
                message = `Congratulations! You have been shortlisted for the ${jobTitle} position at ${companyName}.`;
                type = 'success';
            } else if (status === 'Interview Scheduled') {
                title = 'Interview Scheduled';
                message = `An interview has been scheduled for the ${jobTitle} position at ${companyName}. Please check your calendar.`;
                type = 'warning';
            } else if (status === 'Selected') {
                title = 'Job Offer / Selection';
                message = `Congratulations! You have been selected for the ${jobTitle} role at ${companyName}!`;
                type = 'success';
            } else if (status === 'Rejected') {
                title = 'Application Update';
                message = `We regret to inform you that you were not selected for the ${jobTitle} role at ${companyName}. Wish you the best!`;
                type = 'error';
            }

            await createNotificationHelper(application.applicant, title, message, type);
        }

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true,
            application
        });

    } catch (error) {
        logger.error("Update Status Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
}

export const getApplicationTimeline = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const application = await Application.findById(applicationId)
            .populate({
                path: 'job',
                populate: {
                    path: 'company'
                }
            });
        if (!application) {
            return res.status(404).json({ message: "Application not found", success: false });
        }
        return res.status(200).json({
            success: true,
            application
        });
    } catch (error) {
        logger.error("Get Application Timeline Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
}
