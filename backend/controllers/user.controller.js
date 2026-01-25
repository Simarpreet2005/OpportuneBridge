import { User } from "../models/user.model.js";
import { Resume } from "../models/resume.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let cloudResponse;
        if (req.file) {
            const file = req.file;
            const fileUri = getDataUri(file);
            try {
                if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
                    throw new Error("Cloudinary configuration missing");
                }
                cloudResponse = await cloudinary.uploader.upload(fileUri.content, { resource_type: 'auto' });
            } catch (error) {
                console.error("Cloudinary upload failed in register:", error);
            }
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: cloudResponse ? cloudResponse.secure_url : "",
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message
        });
    }
}
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;

        let files = req.files || {};
        console.log("updateProfile req.body:", req.body);
        console.log("updateProfile req.files type:", typeof files, "keys:", Object.keys(files));

        // Handle Profile Photo
        let profilePhotoUrl = "";
        if (files && files.profilePhoto) {
            try {
                const profilePhotoFile = files.profilePhoto[0];
                console.log("Processing profile photo:", profilePhotoFile.originalname);
                const profilePhotoUri = getDataUri(profilePhotoFile);
                const cloudResponse = await cloudinary.uploader.upload(profilePhotoUri.content, { resource_type: 'auto' });
                console.log("Profile photo uploaded to Cloudinary:", cloudResponse.secure_url);
                profilePhotoUrl = cloudResponse.secure_url;
            } catch (error) {
                console.error("Error uploading profile photo:", error);
            }
        }

        // Handle Resume
        let resumeUrl = "";
        let resumeOriginalName = "";
        if (files && files.resume) {
            try {
                const resumeFile = files.resume[0];
                console.log("Processing resume:", resumeFile.originalname);
                const resumeUri = getDataUri(resumeFile);
                const cloudResponse = await cloudinary.uploader.upload(resumeUri.content, { resource_type: 'auto' });
                console.log("Resume uploaded to Cloudinary:", cloudResponse.secure_url);
                resumeUrl = cloudResponse.secure_url;
                resumeOriginalName = resumeFile.originalname;

                // Create new Resume document
                const newResume = await Resume.create({
                    user: req.id,
                    title: resumeOriginalName,
                    fileUrl: resumeUrl,
                    personalInfo: {
                        fullName: user?.fullname,
                        email: user?.email,
                        phoneNumber: user?.phoneNumber
                    }
                });

                // Add to user's resumes list
                if (!user.profile.resumes) {
                    user.profile.resumes = [];
                }
                user.profile.resumes.push(newResume._id);

            } catch (error) {
                console.error("Error uploading resume:", error);
            }
        }



        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }
        const userId = req.id; // middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }
        // updating data
        if (fullname) user.fullname = fullname
        if (email) user.email = email
        if (phoneNumber) user.phoneNumber = phoneNumber
        if (bio) user.profile.bio = bio
        if (skills) user.profile.skills = skillsArray

        if (profilePhotoUrl) {
            user.profile.profilePhoto = profilePhotoUrl;
        }

        if (resumeUrl) {
            user.profile.resume = resumeUrl;
            user.profile.resumeOriginalName = resumeOriginalName;
        }


        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message: "Profile updated successfully.",
            user,
            success: true
        })
    } catch (error) {
        console.error("updateProfile Error:", error);
        return res.status(500).json({
            message: "Internal server error while updating profile. " + (error.message || ""),
            success: false
        });
    }
}

export const getProfile = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).populate({
            path: 'profile.resumes',
            model: 'Resume'
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}



export const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.find({ role: 'student' })
            .sort({ 'profile.gamification.xp': -1 })
            .limit(10)
            .select('fullname profile.profilePhoto profile.gamification');

        return res.status(200).json({
            leaderboard,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

// Check ATS Score
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Job } from "../models/job.model.js";

export const checkATSScore = async (req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.id;

        const user = await User.findById(userId);
        const job = await Job.findById(jobId);

        if (!user || !job) {
            return res.status(404).json({ message: "User or Job not found", success: false });
        }

        const resumeText = user.profile.skills.join(", "); // Fallback if no full text
        const jobDescription = job.description;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        Act as an ATS (Applicant Tracking System). 
        Evaluate the match between the following candidate skills/resume and job description.
        
        Candidate Skills: ${resumeText}
        Job Description: ${jobDescription}
        
        Return a valid JSON object ONLY:
        {
            "score": <number 0-100>,
            "analysis": "<short 2 sentence analysis of the match>",
            "missing_skills": ["<skill1>", "<skill2>"]
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const atsData = JSON.parse(responseText);

        return res.status(200).json({
            success: true,
            score: atsData.score,
            analysis: atsData.analysis,
            missingSkills: atsData.missing_skills
        });

    } catch (error) {
        console.error("ATS Check Error:", error);
        return res.status(500).json({ message: "Failed to specific ATS score", success: false });
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email configuration exists
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("Email configuration missing: EMAIL_USER or EMAIL_PASS not set");
            return res.status(500).json({
                message: "Email service is not configured. Please contact the administrator.",
                success: false
            });
        }

        const user = await User.findOne({ email });

        // Always return generic response for security
        if (!user) {
            return res.status(200).json({
                message: "If an account exists, a reset email has been sent.",
                success: true
            });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash token before saving
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: "OpportuneBridge Password Reset",
            text: `Reset your password:\n\n${resetUrl}\n\nThis link expires in 15 minutes.`
        });

        return res.status(200).json({
            message: "If an account exists, a reset email has been sent.",
            success: true
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({
            message: "Failed to send reset email. Please try again later.",
            success: false
        });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long",
                success: false
            });
        }

        // Hash incoming token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Token is invalid or expired",
                success: false
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            message: "Password reset successful. Please log in.",
            success: true
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}

export const googleLogin = async (req, res) => {
    try {
        const { googleToken, role } = req.body;

        // Using fetch to get user info from Google UserInfo endpoint
        console.log("Fetching Google user info with token...");
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleToken}`);
        const payload = await response.json();
        console.log("Google payload received:", payload?.email ? "Success for " + payload.email : "Failed");

        if (!payload || !payload.email) {
            return res.status(400).json({ message: "Invalid Google Token", success: false });
        }

        const { email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                fullname: name,
                email,
                phoneNumber: 0,
                password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
                role: role || 'student',
                profile: {
                    profilePhoto: picture,
                }
            });
        }

        const tokenData = { userId: user._id };
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        const userResponse = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.fullname}`,
            user: userResponse,
            success: true
        });
    } catch (error) {
        console.error("Google Login Error:", error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}
