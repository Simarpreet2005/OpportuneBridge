import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import connectDB from "./utils/db.js";
import { logger } from "./utils/logger.js";
import { validateEnv } from "./utils/envValidation.js";
import { seedSuperAdmin } from "./utils/seedSuperAdmin.js";
import { globalLimiter, authLimiter } from "./middleware/rateLimiter.js";
import { validateCloudinaryConfig } from "./utils/cloudinary.js";

import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import resumeRoute from "./routes/resume.route.js";
import adminRoute from "./routes/admin.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import careerAssistantRoute from "./routes/careerAssistant.route.js";
import notificationRoute from "./routes/notification.route.js";
import skillGapRoute from "./routes/skillGap.route.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { configureSocket } from "./services/socket.service.js";

import http from "http";
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://opportunebridge-frontend.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
  }
});

configureSocket(io);

app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

const corsOptions = {
  origin: ["http://localhost:5173", "https://opportunebridge-frontend.onrender.com"],
  credentials: true,
};
app.use(cors(corsOptions));

// Apply global rate limiter to all API routes (except static assets)
app.use('/api', globalLimiter);

// Apply stricter rate limiter to auth endpoints
app.use("/api/v1/user/login", authLimiter);
app.use("/api/v1/user/register", authLimiter);
app.use("/api/v1/user/google-login", authLimiter);

app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  return res.status(200).json({
    status: "ok",
    database: dbStatus,
    timestamp: new Date()
  });
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/resume", resumeRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/analytics", analyticsRoute);
app.use("/api/v1/career-assistant", careerAssistantRoute);
app.use("/api/v1/notification", notificationRoute);
app.use("/api/v1/skill-gap", skillGapRoute);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

// Validate environment variables
validateEnv();

// Validate Cloudinary configuration
validateCloudinaryConfig();

connectDB()
  .then(async () => {
    await seedSuperAdmin();
    server.listen(PORT, () => logger.info(`Server running at port ${PORT}`));
  })
  .catch((err) => logger.error("Server startup failed", { message: err.message }));
