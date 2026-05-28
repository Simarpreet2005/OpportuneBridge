import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isRecruiterOrAdmin from "../middleware/isRecruiterOrAdmin.js";
import { getAdminJobs, getAllJobs, getJobById, postJob, saveJob, getSavedJobs, getJobMatchScore, getRankedCandidates } from "../controllers/job.controller.js";
import { validateObjectIdField, validateObjectIdParam, validateRequiredFields } from "../middleware/validate.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.route("/post").post(
    isAuthenticated,
    isRecruiterOrAdmin,
    validateRequiredFields(["title", "description", "requirements", "salary", "location", "jobType", "experience", "position", "companyId"]),
    validateObjectIdField("companyId"),
    asyncHandler(postJob)
);
router.route("/get").get(asyncHandler(getAllJobs));
router.route("/saved").get(isAuthenticated, asyncHandler(getSavedJobs));
router.route("/getadminjobs").get(isAuthenticated, isRecruiterOrAdmin, asyncHandler(getAdminJobs));
router.route("/get/:id").get(validateObjectIdParam("id"), asyncHandler(getJobById));
router.route("/save/:id").post(isAuthenticated, validateObjectIdParam("id"), asyncHandler(saveJob));
router.route("/match/:id").get(isAuthenticated, validateObjectIdParam("id"), asyncHandler(getJobMatchScore));
router.route("/:id/ranked-candidates").get(isAuthenticated, isRecruiterOrAdmin, validateObjectIdParam("id"), asyncHandler(getRankedCandidates));
router.route("/:id").get(validateObjectIdParam("id"), asyncHandler(getJobById));

export default router;
