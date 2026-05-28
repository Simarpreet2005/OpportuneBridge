import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { getCareerAdvice, getSuggestedPrompts } from "../controllers/careerAssistant.controller.js";
import { validateRequiredFields } from "../middleware/validate.js";

const router = express.Router();

router.route("/advice").post(
    isAuthenticated,
    validateRequiredFields(["query"]),
    asyncHandler(getCareerAdvice)
);

router.route("/suggested-prompts").get(
    isAuthenticated,
    asyncHandler(getSuggestedPrompts)
);

export default router;
