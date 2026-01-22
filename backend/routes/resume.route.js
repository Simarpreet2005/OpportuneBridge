import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createResume, deleteResume, getResumeById, getResumes, optimizeResumeAI, updateResume, calculateATSScore } from "../controllers/resume.controller.js";

const router = express.Router();

router.route("/create").post(isAuthenticated, createResume);
router.route("/update/:id").put(isAuthenticated, updateResume);
router.route("/get").get(isAuthenticated, getResumes);
router.route("/get/:id").get(getResumeById);
router.route("/delete/:id").delete(isAuthenticated, deleteResume);
router.route("/optimize").post(isAuthenticated, optimizeResumeAI);
router.route("/ats-score").post(isAuthenticated, calculateATSScore);

export default router;
