import express from "express";
import isSuperAdmin from "../middlewares/isSuperAdmin.js";
import { getDashboardStats, getAllUsers, deleteUser, getAllCompanies, getAllJobs } from "../controllers/superadmin.controller.js";

const router = express.Router();

router.route("/stats").get(isSuperAdmin, getDashboardStats);
router.route("/users").get(isSuperAdmin, getAllUsers);
router.route("/users/:userId").delete(isSuperAdmin, deleteUser);
router.route("/companies").get(isSuperAdmin, getAllCompanies);
router.route("/jobs").get(isSuperAdmin, getAllJobs);

export default router;
