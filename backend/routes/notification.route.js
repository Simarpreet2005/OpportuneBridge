import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { getNotifications, markAsRead } from "../controllers/notification.controller.js";
import { validateObjectIdParam } from "../middleware/validate.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.route("/").get(isAuthenticated, asyncHandler(getNotifications));
router.route("/:id/read").post(isAuthenticated, validateObjectIdParam("id"), asyncHandler(markAsRead));

export default router;
