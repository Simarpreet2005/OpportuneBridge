import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getMockInterviewById, getMockInterviewsByUserId, startMockInterview, submitAnswers } from "../controllers/mockInterview.controller.js";

const router = express.Router();

router.route("/start").post(isAuthenticated, startMockInterview);
router.route("/submit").post(isAuthenticated, submitAnswers);
router.route("/get").get(isAuthenticated, getMockInterviewsByUserId);
router.route("/get/:id").get(isAuthenticated, getMockInterviewById);

export default router;
