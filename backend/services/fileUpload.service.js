import getDataUri from "../utils/datauri.js";
import { uploadToCloudinary } from "../config/cloudinary.config.js";
import { logger } from "../utils/logger.js";

export const uploadProfilePhoto = async (file) => {
    try {
        if (!file) {
            logger.warn("uploadProfilePhoto: No file provided");
            return null;
        }
        
        logger.info("uploadProfilePhoto: Starting upload", { 
            originalname: file.originalname, 
            size: file.size, 
            mimetype: file.mimetype 
        });
        
        const fileUri = getDataUri(file);
        logger.info("uploadProfilePhoto: DataURI conversion complete", { hasContent: !!fileUri.content });
        
        const cloudResponse = await uploadToCloudinary(fileUri.content);
        
        logger.info("uploadProfilePhoto: Upload successful", { 
            url: cloudResponse.secure_url,
            publicId: cloudResponse.public_id 
        });
        
        return cloudResponse.secure_url;
    } catch (error) {
        logger.error("uploadProfilePhoto: Upload failed", { 
            error: error.message, 
            stack: error.stack,
            originalname: file?.originalname 
        });
        throw new Error(`Profile photo upload failed: ${error.message}`);
    }
};

export const uploadResume = async (file) => {
    try {
        if (!file) {
            logger.warn("uploadResume: No file provided");
            return { url: null, originalName: null };
        }
        
        logger.info("uploadResume: Starting upload", { 
            originalname: file.originalname, 
            size: file.size, 
            mimetype: file.mimetype 
        });
        
        const fileUri = getDataUri(file);
        logger.info("uploadResume: DataURI conversion complete", { hasContent: !!fileUri.content });
        
        const cloudResponse = await uploadToCloudinary(fileUri.content);
        
        logger.info("uploadResume: Upload successful", { 
            url: cloudResponse.secure_url,
            publicId: cloudResponse.public_id,
            originalName: file.originalname
        });
        
        return {
            url: cloudResponse.secure_url,
            originalName: file.originalname
        };
    } catch (error) {
        logger.error("uploadResume: Upload failed", { 
            error: error.message, 
            stack: error.stack,
            originalname: file?.originalname 
        });
        throw new Error(`Resume upload failed: ${error.message}`);
    }
};
