import { User } from "../models/user.model.js";
import { Resume } from "../models/resume.model.js";
import { Job } from "../models/job.model.js";
import crypto from "crypto";
import { logger } from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { uploadProfilePhoto, uploadResume } from "../services/fileUpload.service.js";
import { hashPassword, comparePassword, generateResetToken, createAuthToken, handleGoogleLogin, sendPasswordReset } from "../services/auth.service.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        logger.info("Register request received", { 
            fullname, 
            email, 
            phoneNumber, 
            role,
            hasFile: !!req.file 
        });

        if (!fullname || !email || !phoneNumber || !password || !role) {
            logger.warn("Register validation failed", { missing: { fullname: !fullname, email: !email, phoneNumber: !phoneNumber, password: !password, role: !role } });
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };


        let profilePhotoUrl = "";
        if (req.file) {
            try {
                profilePhotoUrl = await uploadProfilePhoto(req.file);
                logger.info("Profile photo uploaded successfully", { url: profilePhotoUrl });
            } catch (uploadError) {
                logger.error("Profile photo upload failed in register", { error: uploadError.message });
                return res.status(400).json({
                    message: `Profile photo upload failed: ${uploadError.message}`,
                    success: false
                });
            }
        } else {
            logger.info("No profile photo provided, proceeding without it");
        }

        const user = await User.findOne({ email });
        if (user) {
            logger.warn("User already exists", { email });
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }

        const hashedPassword = await hashPassword(password);

        const createdUser = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: profilePhotoUrl || "",
            }
        });

        logger.info("User registered successfully", { userId: createdUser._id, email });

        return res.status(201).json({
            message: "Account created successfully.",
            user: {
                _id: createdUser._id,
                fullname: createdUser.fullname,
                email: createdUser.email,
                phoneNumber: createdUser.phoneNumber,
                role: createdUser.role,
                profile: createdUser.profile
            },
            success: true
        });
    } catch (error) {
        logger.error("Register Error", { error: error.message, stack: error.stack });
        console.error("Register error:", error);
        return errorResponse(res, 500, "Internal Server Error", error.message);
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

        if (user.isSuspended) {
            return res.status(403).json({
                message: "Account suspended",
                success: false
            });
        }

        const isPasswordMatch = await comparePassword(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };

        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const token = createAuthToken(user._id);

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        const cookieOptions = {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === "production"
        };

        return res.status(200).cookie("token", token, cookieOptions).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        logger.error("Login Error", { error: error.message });
        return errorResponse(res, 500, "Internal Server Error");
    }
}
export const logout = async (req, res) => {
    try {
        const cookieOptions = {
            maxAge: 0,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === "production"
        };

        return res.status(200).cookie("token", "", cookieOptions).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        logger.error("Logout Error", { error: error.message });
        return errorResponse(res, 500, "Internal Server Error");
    }
}
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;

        const userId = req.id;
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }

        if (!user.profile) user.profile = {};

        let files = req.files || {};

        // Handle Profile Photo
        let profilePhotoUrl = "";
        if (files && files.profilePhoto) {
            profilePhotoUrl = await uploadProfilePhoto(files.profilePhoto[0]);
        }

        // Handle Resume
        let resumeUrl = "";
        let resumeOriginalName = "";
        if (files && files.resume) {
            const resumeData = await uploadResume(files.resume[0]);
            resumeUrl = resumeData.url;
            resumeOriginalName = resumeData.originalName;

            if (resumeUrl) {
                const newResume = await Resume.create({
                    user: userId,
                    title: resumeOriginalName,
                    fileUrl: resumeUrl,
                    personalInfo: {
                        fullName: user?.fullname,
                        email: user?.email,
                        phoneNumber: user?.phoneNumber
                    }
                });

                if (!user.profile.resumes) {
                    user.profile.resumes = [];
                }
                user.profile.resumes.push(newResume._id);
            }
        }

        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio) user.profile.bio = bio;
        if (skills) user.profile.skills = skillsArray;
        if (profilePhotoUrl) user.profile.profilePhoto = profilePhotoUrl;
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
        logger.error("updateProfile Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error while updating profile.");
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
        logger.error("getProfile Error", { error: error.message });
        return errorResponse(res, 500, "Internal Server Error");
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
        logger.error("getLeaderboard Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
}


export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({
                message: "If an account exists, a reset email has been sent.",
                success: true
            });
        }

        const { resetToken, hashedToken } = generateResetToken();

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        try {
            await sendPasswordReset(user, resetToken);
        } catch (emailError) {
            logger.error("Failed to send reset email", { error: emailError.message });
            return errorResponse(res, 500, "Failed to send reset email. Please try again later.");
        }

        return res.status(200).json({
            message: "If an account exists, a reset email has been sent.",
            success: true
        });

    } catch (error) {
        logger.error("Forgot Password Error", { error: error.message });
        return errorResponse(res, 500, "Failed to send reset email. Please try again later.");
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const { hashedToken } = generateResetToken();
        const incomingHashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: incomingHashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Token is invalid or expired",
                success: false
            });
        }

        user.password = await hashPassword(password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            message: "Password reset successful. Please log in.",
            success: true
        });

    } catch (error) {
        logger.error("Reset Password Error", { error: error.message });
        return errorResponse(res, 500, "Internal Server Error");
    }
}

export const googleLogin = async (req, res) => {
    try {
        const { googleToken, role } = req.body;

        const googleData = await handleGoogleLogin(googleToken, role);

        let user = await User.findOne({ email: googleData.email });

        if (!user) {
            user = await User.create({
                fullname: googleData.fullname,
                email: googleData.email,
                phoneNumber: 0,
                password: await hashPassword(crypto.randomBytes(16).toString('hex')),
                role: googleData.role,
                profile: {
                    profilePhoto: googleData.profilePhoto,
                }
            });
        }

        if (user.isSuspended) {
            return res.status(403).json({
                message: "Account suspended",
                success: false
            });
        }

        const token = createAuthToken(user._id);

        const userResponse = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        const cookieOptions = {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === "production"
        };

        return res.status(200).cookie("token", token, cookieOptions).json({
            message: `Welcome back ${user.fullname}`,
            user: userResponse,
            success: true
        });
    } catch (error) {
        logger.error("Google Login Error", { error: error.message });
        return errorResponse(res, 500, "Internal Server Error");
    }
}
