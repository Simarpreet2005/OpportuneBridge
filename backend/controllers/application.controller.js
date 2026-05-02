import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { generateGeminiText, parseGeminiJson } from "../utils/gemini.js";

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            })
        };

        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }

        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
        });

        job.applications.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message: "Job applied successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
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
        if (!application) {
            return res.status(404).json({
                message: "No Applications",
                success: false
            })
        };
        return res.status(200).json({
            application,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant'
            }
        });
        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            })
        };
        return res.status(200).json({
            job,
            succees: true
        });
    } catch (error) {
        console.log(error);
    }
}
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;
        if (!status) {
            return res.status(400).json({
                message: 'status is required',
                success: false
            })
        };


        const application = await Application.findOne({ _id: applicationId });
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            })
        };


        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true
        });

    } catch (error) {
        console.log(error);
    }
}


export const checkApplicantATS = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId)
            .populate('applicant')
            .populate('job');

        if (!application) {
            return res.status(404).json({
                message: "Application not found",
                success: false
            });
        }

        const applicant = application.applicant;
        const job = application.job;

        const prompt = `Act as an ATS (Applicant Tracking System). Analyze this candidate's profile against the job requirements.

Candidate Profile:
- Skills: ${applicant.profile.skills?.join(', ') || 'Not specified'}
- Bio: ${applicant.profile.bio || 'Not specified'}

Job Requirements:
- Title: ${job.title}
- Description: ${job.description}
- Required Skills: ${job.requirements?.join(', ') || 'Not specified'}
- Experience: ${job.experienceLevel || 'Not specified'} years

Provide:
1. ATS Score (0-100)
2. Match Analysis (2-3 sentences)
3. Missing Skills (list)
4. Recommendation (Shortlist/Review/Reject)

Return JSON format: { "score": number, "analysis": "string", "missingSkills": ["string"], "recommendation": "string" }
Return ONLY the JSON.`;

        const text = await generateGeminiText(prompt);
        const data = parseGeminiJson(text);

        return res.status(200).json({
            ...data,
            applicantName: applicant.fullname,
            success: true
        });

    } catch (error) {
        console.error("ATS Check Error:", error);
        return res.status(500).json({
            message: "Failed to check ATS score",
            success: false
        });
    }
}
