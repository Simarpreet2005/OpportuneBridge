import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
    try {
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

        const user = await User.findById(decoded.userId).select("_id role isSuspended");
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

        req.id = user._id.toString();
        req.user = user;
        return next();
    } catch (error) {
        const cookieOptions = {
            maxAge: 0,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production"
        };
        return res.status(401).cookie("token", "", cookieOptions).json({
            message: "Session expired. Please log in again.",
            success: false
        });
    }
};

export default isAuthenticated;
