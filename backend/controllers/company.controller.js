import { Company } from "../models/company.model.js";
import { logger } from "../utils/logger.js";
import { errorResponse } from "../utils/apiResponse.js";
import { uploadProfilePhoto } from "../services/fileUpload.service.js";

export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required.",
                success: false
            });
        }
        let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({
                message: "You can't register same company.",
                success: false
            })
        };
        company = await Company.create({
            name: companyName,
            userId: req.id
        });

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true
        })
    } catch (error) {
        logger.error("Company Controller Error", { error: error.message, stack: error.stack });
        return errorResponse(res, 500, "Internal server error", error.message);
    }
}
export const getCompany = async (req, res) => {
    try {
        const userId = req.id;
        const companies = await Company.find({ userId });
        return res.status(200).json({
            companies,
            success: true
        })
    } catch (error) {
        logger.error("Company Controller Error", { error: error.message, stack: error.stack });
        return errorResponse(res, 500, "Internal server error", error.message);
    }
}

export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            })
        }
        return res.status(200).json({
            company,
            success: true
        })
    } catch (error) {
        logger.error("Company Controller Error", { error: error.message, stack: error.stack });
        return errorResponse(res, 500, "Internal server error", error.message);
    }
}
export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;

        logger.info("updateCompany request received", { 
            companyId: req.params.id, 
            hasFile: !!req.file,
            name, 
            description, 
            website, 
            location 
        });

        let logo;
        if (req.file) {
            try {
                logo = await uploadProfilePhoto(req.file);
                logger.info("Company logo uploaded successfully", { url: logo });
            } catch (uploadError) {
                logger.error("Company logo upload failed", { error: uploadError.message });
                return res.status(400).json({
                    message: `Logo upload failed: ${uploadError.message}`,
                    success: false
                });
            }
        }

        const updateData = { name, description, website, location };
        if (logo) {
            updateData.logo = logo;
        }

        const isPrivileged = req.user?.role === "admin" || req.user?.role === "superadmin";
        const companyQuery = isPrivileged ? { _id: req.params.id } : { _id: req.params.id, userId: req.id };

        const company = await Company.findOneAndUpdate(companyQuery, updateData, { new: true });

        if (!company) {
            logger.warn("Company not found for update", { companyId: req.params.id, isPrivileged });
            return res.status(404).json({
                message: "Company not found.",
                success: false
            })
        }

        logger.info("Company updated successfully", { companyId: company._id });

        return res.status(200).json({
            message: "Company information updated.",
            success: true
        })

    } catch (error) {
        logger.error("updateCompany error", { error: error.message, stack: error.stack });
        return errorResponse(res, 500, "Internal server error");
    }
}


