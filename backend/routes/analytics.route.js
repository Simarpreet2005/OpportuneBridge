import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { getRecruiterAnalytics, getJobAnalytics } from "../controllers/analytics.controller.js";
import { validateObjectIdParam } from "../middleware/validate.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.route("/recruiter").get(isAuthenticated, asyncHandler(getRecruiterAnalytics));
router.route("/job/:jobId").get(isAuthenticated, validateObjectIdParam("jobId"), asyncHandler(getJobAnalytics));

export default router;
