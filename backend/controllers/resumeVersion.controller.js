import { uploadResumeVersion, getResumeVersions, setActiveResumeVersion, deleteResumeVersion, getActiveResumeVersion } from "../services/resumeVersion.service.js";
import { logger } from "../utils/logger.js";
import { errorResponse } from "../utils/apiResponse.js";

export const uploadResumeVersionController = async (req, res) => {
    try {
        const userId = req.id;
        
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required",
                success: false
            });
        }

        const { skillsExtracted } = req.body;
        let skillsArray = [];
        if (skillsExtracted) {
            try {
                skillsArray = JSON.parse(skillsExtracted);
                if (!Array.isArray(skillsArray)) skillsArray = [];
            } catch {
                return res.status(400).json({
                    message: "Invalid skillsExtracted JSON",
                    success: false
                });
            }
        }

        const resumeVersion = await uploadResumeVersion(userId, req.file, skillsArray);

        return res.status(201).json({
            message: "Resume version uploaded successfully",
            resumeVersion,
            success: true
        });
    } catch (error) {
        logger.error("Upload Resume Version Controller Error", { error: error.message });
        return errorResponse(res, 500, error.message || "Internal server error");
    }
};

export const getResumeVersionsController = async (req, res) => {
    try {
        const userId = req.id;
        const versions = await getResumeVersions(userId);

        return res.status(200).json({
            success: true,
            resumeVersions: versions
        });
    } catch (error) {
        logger.error("Get Resume Versions Controller Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};

export const setActiveResumeVersionController = async (req, res) => {
    try {
        const userId = req.id;
        const { versionId } = req.params;

        if (!versionId) {
            return res.status(400).json({
                message: "Version ID is required",
                success: false
            });
        }

        const resumeVersion = await setActiveResumeVersion(userId, versionId);

        return res.status(200).json({
            message: "Active resume version updated successfully",
            resumeVersion,
            success: true
        });
    } catch (error) {
        logger.error("Set Active Resume Version Controller Error", { error: error.message });
        return errorResponse(res, 500, error.message || "Internal server error");
    }
};

export const deleteResumeVersionController = async (req, res) => {
    try {
        const userId = req.id;
        const { versionId } = req.params;

        if (!versionId) {
            return res.status(400).json({
                message: "Version ID is required",
                success: false
            });
        }

        const result = await deleteResumeVersion(userId, versionId);

        return res.status(200).json({
            message: result.message,
            success: true
        });
    } catch (error) {
        logger.error("Delete Resume Version Controller Error", { error: error.message });
        return errorResponse(res, 500, error.message || "Internal server error");
    }
};

export const getActiveResumeVersionController = async (req, res) => {
    try {
        const userId = req.id;
        const activeVersion = await getActiveResumeVersion(userId);

        return res.status(200).json({
            success: true,
            activeVersion
        });
    } catch (error) {
        logger.error("Get Active Resume Version Controller Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};
