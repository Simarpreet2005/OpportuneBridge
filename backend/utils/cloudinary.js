import { v2 as cloudinary } from 'cloudinary';
import { logger } from "./logger.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const validateCloudinaryConfig = () => {
    const missing = [];
    
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        missing.push('CLOUDINARY_CLOUD_NAME');
    }
    if (!process.env.CLOUDINARY_API_KEY) {
        missing.push('CLOUDINARY_API_KEY');
    }
    if (!process.env.CLOUDINARY_API_SECRET) {
        missing.push('CLOUDINARY_API_SECRET');
    }
    
    if (missing.length > 0) {
        logger.error('Cloudinary configuration missing', { missing });
        throw new Error(`Missing Cloudinary environment variables: ${missing.join(', ')}`);
    }
    
    logger.info('Cloudinary configuration validated', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        has_api_key: !!process.env.CLOUDINARY_API_KEY,
        has_api_secret: !!process.env.CLOUDINARY_API_SECRET
    });
    
    return true;
};

export default cloudinary;
