import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isRecruiterOrSuperAdmin from "../middlewares/isRecruiterOrSuperAdmin.js";
import { getAdminJobs, getAllJobs, getJobById, postJob, saveJob } from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, isRecruiterOrSuperAdmin, postJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);
router.route("/save/:id").post(isAuthenticated, saveJob);

export default router;
