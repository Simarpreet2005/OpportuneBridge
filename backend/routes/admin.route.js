import express from "express";
import isAdmin from "../middleware/isAdmin.js";
import { validateObjectIdParam } from "../middleware/validate.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    getAllCompanies,
    getAllJobs,
    deleteCompany,
    deleteJob,
    suspendUser,
    getAllApplications,
    deleteApplication
} from "../controllers/admin.controller.js";

const router = express.Router();

router.route("/stats").get(isAdmin, asyncHandler(getDashboardStats));
router.route("/users").get(isAdmin, asyncHandler(getAllUsers));
router.route("/users/:userId").delete(isAdmin, validateObjectIdParam("userId"), asyncHandler(deleteUser));
router.route("/users/:userId/suspend").patch(isAdmin, validateObjectIdParam("userId"), asyncHandler(suspendUser));
router.route("/companies").get(isAdmin, asyncHandler(getAllCompanies));
router.route("/companies/:companyId").delete(isAdmin, validateObjectIdParam("companyId"), asyncHandler(deleteCompany));
router.route("/jobs").get(isAdmin, asyncHandler(getAllJobs));
router.route("/jobs/:jobId").delete(isAdmin, validateObjectIdParam("jobId"), asyncHandler(deleteJob));
router.route("/applications").get(isAdmin, asyncHandler(getAllApplications));
router.route("/applications/:applicationId").delete(isAdmin, validateObjectIdParam("applicationId"), asyncHandler(deleteApplication));

export default router;
