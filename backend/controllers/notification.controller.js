import { Notification } from "../models/notification.model.js";
import { logger } from "../utils/logger.js";
import { errorResponse } from "../utils/apiResponse.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.id;
        const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        logger.error("getNotifications Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};

export const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        logger.error("markAsRead Error", { error: error.message });
        return errorResponse(res, 500, "Internal server error");
    }
};

// Helper function to create notification from controllers
export const createNotificationHelper = async (recipientId, title, message, type = 'info', link = '') => {
    try {
        await Notification.create({
            recipient: recipientId,
            title,
            message,
            type,
            link
        });
    } catch (error) {
        logger.error("createNotificationHelper Error", { error: error.message });
    }
};
