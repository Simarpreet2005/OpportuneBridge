import express from "express";
import { submitCode, getMySubmissions } from "../controllers/submission.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/submit").post(isAuthenticated, submitCode);
router.route("/history/:challengeId").get(isAuthenticated, getMySubmissions);

export default router;
