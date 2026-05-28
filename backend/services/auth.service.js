import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../config/jwt.config.js";
import { verifyGoogleToken } from "../config/google.config.js";
import { sendPasswordResetEmail } from "../config/email.config.js";
import { logger } from "../utils/logger.js";

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

export const generateResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    return { resetToken, hashedToken };
};

export const createAuthToken = (userId) => {
    const tokenData = { userId };
    return generateToken(tokenData);
};

export const handleGoogleLogin = async (googleToken, role) => {
    try {
        const payload = await verifyGoogleToken(googleToken);
        const { email, name, picture } = payload;
        
        return {
            email,
            fullname: name,
            profilePhoto: picture,
            role: role || 'student'
        };
    } catch (error) {
        logger.error("Google Login Error", { error: error.message });
        throw new Error("Google authentication failed");
    }
};

export const sendPasswordReset = async (user, resetToken) => {
    try {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        await sendPasswordResetEmail(user.email, resetUrl);
        return true;
    } catch (error) {
        logger.error("Failed to send reset email", { error: error.message });
        throw new Error("Failed to send reset email");
    }
};
