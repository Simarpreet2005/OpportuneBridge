import express from "express";
import isSuperAdmin from "../middlewares/isSuperAdmin.js";
import {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    getAllCompanies,
    getAllJobs,
    deleteCompany,
    deleteJob,
    deletePost,
    suspendUser,
    getAllApplications,
    deleteApplication,
    deleteChallenge
} from "../controllers/superadmin.controller.js";

const router = express.Router();

router.route("/stats").get(isSuperAdmin, getDashboardStats);
router.route("/users").get(isSuperAdmin, getAllUsers);
router.route("/users/:userId").delete(isSuperAdmin, deleteUser);
router.route("/users/:userId/suspend").patch(isSuperAdmin, suspendUser);
router.route("/companies").get(isSuperAdmin, getAllCompanies);
router.route("/companies/:companyId").delete(isSuperAdmin, deleteCompany);
router.route("/jobs").get(isSuperAdmin, getAllJobs);
router.route("/jobs/:jobId").delete(isSuperAdmin, deleteJob);
router.route("/posts/:postId").delete(isSuperAdmin, deletePost);
router.route("/applications").get(isSuperAdmin, getAllApplications);
router.route("/applications/:applicationId").delete(isSuperAdmin, deleteApplication);
router.route("/challenges/:challengeId").delete(isSuperAdmin, deleteChallenge);

export default router;
