import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAllUserSubmissions, getSubmissionsForChallenge, submitCode } from "../controllers/submission.controller.js";

const router = express.Router();

router.route("/").post(isAuthenticated, submitCode);
router.route("/").get(isAuthenticated, getAllUserSubmissions);
router.route("/challenge/:challengeId").get(isAuthenticated, getSubmissionsForChallenge);

export default router;
