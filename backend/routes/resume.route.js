import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { uploadResumeVersionController, getResumeVersionsController, setActiveResumeVersionController, deleteResumeVersionController, getActiveResumeVersionController } from "../controllers/resumeVersion.controller.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

// New resume version tracking routes
router.route("/upload-version").post(isAuthenticated, singleUpload, asyncHandler(uploadResumeVersionController));
router.route("/versions").get(isAuthenticated, asyncHandler(getResumeVersionsController));
router.route("/set-active/:versionId").patch(isAuthenticated, asyncHandler(setActiveResumeVersionController));
router.route("/version/:versionId").delete(isAuthenticated, asyncHandler(deleteResumeVersionController));
router.route("/active-version").get(isAuthenticated, asyncHandler(getActiveResumeVersionController));

export default router;
