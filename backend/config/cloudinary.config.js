import cloudinary from "../utils/cloudinary.js";
import { logger } from "../utils/logger.js";

export const uploadToCloudinary = async (fileUri, resourceType = 'auto') => {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            logger.error("Cloudinary configuration missing", {
                hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
                hasApiKey: !!process.env.CLOUDINARY_API_KEY,
                hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
            });
            throw new Error("Cloudinary configuration missing. Check environment variables.");
        }
        
        logger.info("Cloudinary upload starting", { resourceType, hasFileUri: !!fileUri });
        
        const response = await cloudinary.uploader.upload(fileUri, { resource_type: resourceType });
        
        logger.info("Cloudinary upload successful", {
            publicId: response.public_id,
            secureUrl: response.secure_url,
            resourceType: response.resource_type,
            bytes: response.bytes
        });
        
        return response;
    } catch (error) {
        logger.error("Cloudinary upload failed", {
            error: error.message,
            stack: error.stack,
            code: error.http_code || error.code,
            resourceType
        });
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

export default cloudinary;
