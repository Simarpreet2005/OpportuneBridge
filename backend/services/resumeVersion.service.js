import { ResumeVersion } from "../models/resumeVersion.model.js";
import { User } from "../models/user.model.js";
import { Resume } from "../models/resume.model.js";
import { uploadResume } from "./fileUpload.service.js";
import { logger } from "../utils/logger.js";

export const uploadResumeVersion = async (userId, file, skillsExtracted = []) => {
    try {
        // Upload to Cloudinary
        const resumeData = await uploadResume(file);
        if (!resumeData.url) {
            throw new Error("Failed to upload resume to Cloudinary");
        }

        // Get latest version for this user
        const latestVersion = await ResumeVersion.findOne({ userId })
            .sort({ version: -1 })
            .limit(1);

        const newVersionNumber = latestVersion ? latestVersion.version + 1 : 1;

        // Set all previous versions to inactive
        await ResumeVersion.updateMany(
            { userId, isActive: true },
            { isActive: false }
        );

        // Create new resume version
        const newResumeVersion = await ResumeVersion.create({
            userId,
            version: newVersionNumber,
            resumeUrl: resumeData.url,
            fileName: resumeData.originalName,
            skillsExtracted,
            isActive: true
        });

        // Sync with user profile fields
        const userObj = await User.findById(userId);
        if (userObj) {
            userObj.profile.resume = resumeData.url;
            userObj.profile.resumeOriginalName = resumeData.originalName;
            
            // Set all previous Resume models to inactive
            await Resume.updateMany(
                { user: userId, isActive: true },
                { isActive: false }
            );

            // Create Resume model for candidate ranking
            const newResume = await Resume.create({
                user: userId,
                title: resumeData.originalName,
                fileUrl: resumeData.url,
                isActive: true,
                personalInfo: {
                    fullName: userObj.fullname,
                    email: userObj.email,
                    phoneNumber: userObj.phoneNumber ? String(userObj.phoneNumber) : ""
                }
            });

            if (!userObj.profile.resumes) {
                userObj.profile.resumes = [];
            }
            userObj.profile.resumes.push(newResume._id);
            await userObj.save();
        }

        return newResumeVersion;
    } catch (error) {
        logger.error("Upload Resume Version Error", { error: error.message });
        throw error;
    }
};

export const getResumeVersions = async (userId) => {
    try {
        const versions = await ResumeVersion.find({ userId })
            .sort({ version: -1 });
        return versions;
    } catch (error) {
        logger.error("Get Resume Versions Error", { error: error.message });
        throw error;
    }
};

export const setActiveResumeVersion = async (userId, versionId) => {
    try {
        // Check if version belongs to user
        const resumeVersion = await ResumeVersion.findOne({ _id: versionId, userId });
        if (!resumeVersion) {
            throw new Error("Resume version not found");
        }

        // Set all versions to inactive
        await ResumeVersion.updateMany(
            { userId, isActive: true },
            { isActive: false }
        );

        // Set specified version to active
        resumeVersion.isActive = true;
        await resumeVersion.save();

        // Sync with user profile fields
        const userObj = await User.findById(userId);
        if (userObj) {
            userObj.profile.resume = resumeVersion.resumeUrl;
            userObj.profile.resumeOriginalName = resumeVersion.fileName;

            // Set all other Resume models to inactive
            await Resume.updateMany(
                { user: userId, isActive: true },
                { isActive: false }
            );

            // Find or create Resume model
            let existingResume = await Resume.findOne({ user: userId, fileUrl: resumeVersion.resumeUrl });
            if (existingResume) {
                existingResume.isActive = true;
                await existingResume.save();
            } else {
                existingResume = await Resume.create({
                    user: userId,
                    title: resumeVersion.fileName,
                    fileUrl: resumeVersion.resumeUrl,
                    isActive: true,
                    personalInfo: {
                        fullName: userObj.fullname,
                        email: userObj.email,
                        phoneNumber: userObj.phoneNumber ? String(userObj.phoneNumber) : ""
                    }
                });
                if (!userObj.profile.resumes) {
                    userObj.profile.resumes = [];
                }
                userObj.profile.resumes.push(existingResume._id);
            }
            await userObj.save();
        }

        return resumeVersion;
    } catch (error) {
        logger.error("Set Active Resume Version Error", { error: error.message });
        throw error;
    }
};

export const deleteResumeVersion = async (userId, versionId) => {
    try {
        // Check if version belongs to user
        const resumeVersion = await ResumeVersion.findOne({ _id: versionId, userId });
        if (!resumeVersion) {
            throw new Error("Resume version not found");
        }

        // Get total count of versions for this user
        const totalVersions = await ResumeVersion.countDocuments({ userId });

        // Do not allow deleting last remaining resume
        if (totalVersions === 1) {
            throw new Error("Cannot delete the last remaining resume version");
        }

        const wasActive = resumeVersion.isActive;
        const deletedUrl = resumeVersion.resumeUrl;

        // Delete the version
        await ResumeVersion.deleteOne({ _id: versionId });

        // Delete corresponding Resume document and pull from user profile list
        const correspondingResume = await Resume.findOne({ user: userId, fileUrl: deletedUrl });
        if (correspondingResume) {
            const resumeId = correspondingResume._id;
            await User.updateOne(
                { _id: userId },
                { $pull: { "profile.resumes": resumeId } }
            );
            await Resume.deleteOne({ _id: resumeId });
        }

        // If active version was deleted, make latest remaining version active
        if (wasActive) {
            const latestVersion = await ResumeVersion.findOne({ userId })
                .sort({ version: -1 })
                .limit(1);

            if (latestVersion) {
                latestVersion.isActive = true;
                await latestVersion.save();

                // Sync user profile fields and Resume model
                const userObj = await User.findById(userId);
                if (userObj) {
                    userObj.profile.resume = latestVersion.resumeUrl;
                    userObj.profile.resumeOriginalName = latestVersion.fileName;

                    await Resume.updateMany(
                        { user: userId, isActive: true },
                        { isActive: false }
                    );

                    let existingResume = await Resume.findOne({ user: userId, fileUrl: latestVersion.resumeUrl });
                    if (existingResume) {
                        existingResume.isActive = true;
                        await existingResume.save();
                    } else {
                        existingResume = await Resume.create({
                            user: userId,
                            title: latestVersion.fileName,
                            fileUrl: latestVersion.resumeUrl,
                            isActive: true,
                            personalInfo: {
                                fullName: userObj.fullname,
                                email: userObj.email,
                                phoneNumber: userObj.phoneNumber ? String(userObj.phoneNumber) : ""
                            }
                        });
                        if (!userObj.profile.resumes) {
                            userObj.profile.resumes = [];
                        }
                        userObj.profile.resumes.push(existingResume._id);
                    }
                    await userObj.save();
                }
            }
        }

        return { success: true, message: "Resume version deleted successfully" };
    } catch (error) {
        logger.error("Delete Resume Version Error", { error: error.message });
        throw error;
    }
};

export const getActiveResumeVersion = async (userId) => {
    try {
        const activeVersion = await ResumeVersion.findOne({ userId, isActive: true });
        return activeVersion;
    } catch (error) {
        logger.error("Get Active Resume Version Error", { error: error.message });
        throw error;
    }
};
