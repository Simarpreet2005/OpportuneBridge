import express from "express";
import { getMatchScore } from "../controllers/ai.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/score").post(isAuthenticated, getMatchScore);

export default router;
