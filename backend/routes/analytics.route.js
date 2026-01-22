import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getRecruiterAnalytics, getJobAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.route("/recruiter").get(isAuthenticated, getRecruiterAnalytics);
router.route("/job/:jobId").get(isAuthenticated, getJobAnalytics);

export default router;
