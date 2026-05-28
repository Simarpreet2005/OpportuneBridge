import mongoose from "mongoose";
import { logger } from "./logger.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info("MongoDB connected successfully");
    } catch (error) {
        logger.error("MongoDB connection failed", { message: error.message });
        throw error;
    }
}
export default connectDB;
