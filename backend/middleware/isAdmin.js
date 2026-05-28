import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const isAdmin = async (req, res, next) => {
    try {
        let userId = req.id;
        if (!userId) {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({
                    message: "User not authenticated",
                    success: false
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded?.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
                return res.status(401).json({
                    message: "Invalid token",
                    success: false
                });
            }
            userId = decoded.userId;
            req.id = decoded.userId;
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            });
        }

        const user = await User.findById(userId).select("_id role isSuspended");
        if (!user) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            });
        }

        if (user.isSuspended) {
            return res.status(403).json({
                message: "Account suspended",
                success: false
            });
        }

        if (user.role !== "admin" && user.role !== "superadmin") {
            return res.status(403).json({
                message: "Access denied. Admin only.",
                success: false
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        const cookieOptions = {
            maxAge: 0,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        };
        return res.status(401).cookie("token", "", cookieOptions).json({
            message: "Session expired. Please log in again.",
            success: false
        });
    }
};

export default isAdmin;
