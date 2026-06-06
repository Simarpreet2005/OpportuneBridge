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
import printRoutes from "./utils/printRoutes.js";

import http from "http";
import { Server } from "socket.io";


const app = express();
const server = http.createServer(app);
const defaultOrigins = [
  "http://localhost:5173",
  "https://opportune-bridge.vercel.app",
];
const configuredOrigins = [
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
  process.env.FRONTEND_URL,
  ...defaultOrigins,
];
const allowedOrigins = [...new Set(
  configuredOrigins
    .filter(Boolean)
    .map(origin => origin.trim().replace(/\/$/, ""))
)];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalizedOrigin = origin.replace(/\/$/, "");
  return allowedOrigins.includes(normalizedOrigin);
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
    methods: ["GET", "POST"],
    credentials: true,
  }
});

configureSocket(io);

// Trust proxy required for Render to give correct IP for rate limiting
app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Health check (exempt from rate limits)
app.get("/api/v1/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  return res.status(200).json({
    status: "ok",
    database: dbStatus,
    timestamp: new Date()
  });
});

// Apply global rate limiter to all API routes (except static assets)
app.use('/api', globalLimiter);

// Apply stricter rate limiter to auth endpoints
app.use("/api/v1/user/login", authLimiter);
app.use("/api/v1/user/register", authLimiter);
app.use("/api/v1/user/google-login", authLimiter);

app.get("/", (req, res) => {
  return res.status(200).send("OpportuneBridge API is running successfully!");
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
    // Print all registered routes for debugging
    printRoutes(app);
    server.listen(PORT, () => logger.info(`Server running at port ${PORT}`));
  })
  .catch((err) => logger.error("Server startup failed", { message: err?.message || "Unknown error", stack: err?.stack, error: err }));
