import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { User } from "../models/user.model.js";

export const getRecruiterAnalytics = async (req, res) => {
    try {
        const recruiterId = req.id;
        const { timeRange = 'all' } = req.query; 
       
        let dateFilter = {};
        if (timeRange !== 'all') {
            const days = parseInt(timeRange);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            dateFilter = { createdAt: { $gte: startDate } };
        }

        const recruiterJobs = await Job.find({ created_by: recruiterId })
            .populate('applications')
            .populate('company');

        const jobIds = recruiterJobs.map(job => job._id);

        const applications = await Application.find({
            job: { $in: jobIds },
            ...dateFilter
        }).populate('applicant').populate('job');

        const totalJobs = recruiterJobs.length;
        const totalApplications = applications.length;
        const totalCompanies = await Company.countDocuments({ userId: recruiterId });

        const statusBreakdown = {
            pending: applications.filter(app => app.status === 'pending').length,
            accepted: applications.filter(app => app.status === 'accepted').length,
            rejected: applications.filter(app => app.status === 'rejected').length
        };

        const acceptanceRate = totalApplications > 0
            ? ((statusBreakdown.accepted / totalApplications) * 100).toFixed(1)
            : 0;

        const applicationRate = totalJobs > 0
            ? (totalApplications / totalJobs).toFixed(1)
            : 0;

        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = applications.filter(app => {
                const appDate = new Date(app.createdAt);
                return appDate >= date && appDate < nextDate;
            }).length;

            last30Days.push({
                date: date.toISOString().split('T')[0],
                applications: count
            });
        }

        const jobPerformance = recruiterJobs.map(job => ({
            id: job._id,
            title: job.title,
            company: job.company?.name || 'N/A',
            applicants: job.applications?.length || 0,
            accepted: applications.filter(app =>
                app.job.toString() === job._id.toString() && app.status === 'accepted'
            ).length
        })).sort((a, b) => b.applicants - a.applicants).slice(0, 5);

     
        const recentActivity = applications
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10)
            .map(app => ({
                id: app._id,
                applicantName: app.applicant?.fullname || 'Unknown',
                jobTitle: app.job?.title || 'Unknown',
                status: app.status,
                createdAt: app.createdAt
            }));

        const acceptedApps = applications.filter(app => app.status === 'accepted');
        let avgTimeToHire = 0;
        if (acceptedApps.length > 0) {
            const totalDays = acceptedApps.reduce((sum, app) => {
                const created = new Date(app.createdAt);
                const updated = new Date(app.updatedAt);
                const days = Math.floor((updated - created) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0);
            avgTimeToHire = Math.round(totalDays / acceptedApps.length);
        }

        return res.status(200).json({
            success: true,
            analytics: {
                overview: {
                    totalJobs,
                    totalApplications,
                    totalCompanies,
                    acceptanceRate: parseFloat(acceptanceRate),
                    applicationRate: parseFloat(applicationRate),
                    avgTimeToHire
                },
                statusBreakdown,
                timeSeries: last30Days,
                topJobs: jobPerformance,
                recentActivity,
                funnel: {
                    applied: totalApplications,
                    reviewed: statusBreakdown.accepted + statusBreakdown.rejected,
                    accepted: statusBreakdown.accepted
                }
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        return res.status(500).json({
            message: "Failed to fetch analytics",
            success: false
        });
    }
};

export const getJobAnalytics = async (req, res) => {
    try {
        const { jobId } = req.params;
        const recruiterId = req.id;

        
        const job = await Job.findOne({ _id: jobId, created_by: recruiterId })
            .populate('applications')
            .populate('company');

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

   
        const applications = await Application.find({ job: jobId })
            .populate('applicant');

        const statusBreakdown = {
            pending: applications.filter(app => app.status === 'pending').length,
            accepted: applications.filter(app => app.status === 'accepted').length,
            rejected: applications.filter(app => app.status === 'rejected').length
        };

        return res.status(200).json({
            success: true,
            analytics: {
                job: {
                    id: job._id,
                    title: job.title,
                    company: job.company?.name,
                    createdAt: job.createdAt
                },
                totalApplications: applications.length,
                statusBreakdown,
                applications: applications.map(app => ({
                    id: app._id,
                    applicant: app.applicant?.fullname,
                    status: app.status,
                    appliedAt: app.createdAt
                }))
            }
        });

    } catch (error) {
        console.error("Job Analytics Error:", error);
        return res.status(500).json({
            message: "Failed to fetch job analytics",
            success: false
        });
    }
};
