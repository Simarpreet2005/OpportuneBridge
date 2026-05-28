import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isRecruiterOrAdmin from "../middleware/isRecruiterOrAdmin.js";
import { applyJob, getApplicants, getAppliedJobs, updateStatus, getApplicationTimeline } from "../controllers/application.controller.js";
import { validateObjectIdParam, validateRequiredFields } from "../middleware/validate.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.route("/apply/:id").post(isAuthenticated, validateObjectIdParam("id"), asyncHandler(applyJob));
router.route("/get").get(isAuthenticated, asyncHandler(getAppliedJobs));
router.route("/:id/applicants").get(isAuthenticated, isRecruiterOrAdmin, validateObjectIdParam("id"), asyncHandler(getApplicants));
router.route("/status/:id/update").post(isAuthenticated, isRecruiterOrAdmin, validateObjectIdParam("id"), validateRequiredFields(["status"]), asyncHandler(updateStatus));
router.route("/:id/timeline").get(isAuthenticated, validateObjectIdParam("id"), asyncHandler(getApplicationTimeline));

export default router;
