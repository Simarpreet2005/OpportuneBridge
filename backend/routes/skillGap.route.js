import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { getSkillGapInsights } from "../controllers/skillGap.controller.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.route("/insights").get(isAuthenticated, asyncHandler(getSkillGapInsights));

export default router;
