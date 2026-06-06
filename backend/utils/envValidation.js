import { logger } from "./logger.js";

const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'GROQ_API_KEY'
];

const optionalEnvVars = [
    'NODE_ENV',
    'PORT',
    'FRONTEND_URL',
    'ALLOWED_ORIGINS',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASS',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
];

export const validateEnv = () => {
    const missing = [];
    const warnings = [];

    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    });

    optionalEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            warnings.push(envVar);
        }
    });

    if (missing.length > 0) {
        logger.error('Missing required environment variables', { missing });
        process.exit(1);
    }

    if (warnings.length > 0) {
        logger.warn('Missing optional environment variables', { warnings });
    }

    logger.info('Environment validation passed');
    return true;
};

export const getEnvVar = (key, defaultValue = null) => {
    return process.env[key] || defaultValue;
};
