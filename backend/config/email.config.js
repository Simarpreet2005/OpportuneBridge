import nodemailer from "nodemailer";

export const createEmailTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Email configuration missing: EMAIL_USER or EMAIL_PASS not set");
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
    try {
        const transporter = createEmailTransporter();
        
        await transporter.sendMail({
            to: email,
            from: process.env.EMAIL_USER,
            subject: "OpportuneBridge Password Reset",
            text: `Reset your password:\n\n${resetUrl}\n\nThis link expires in 15 minutes.`
        });
        
        return true;
    } catch (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
};
