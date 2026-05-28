import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isRecruiterOrAdmin from "../middleware/isRecruiterOrAdmin.js";
import { getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middleware/multer.js";
import { validateObjectIdParam, validateRequiredFields } from "../middleware/validate.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.route("/register").post(isAuthenticated, isRecruiterOrAdmin, validateRequiredFields(["companyName"]), asyncHandler(registerCompany));
router.route("/get").get(isAuthenticated, asyncHandler(getCompany));
router.route("/get/:id").get(isAuthenticated, validateObjectIdParam("id"), asyncHandler(getCompanyById));
router.route("/update/:id").put(isAuthenticated, isRecruiterOrAdmin, validateObjectIdParam("id"), singleUpload, asyncHandler(updateCompany));

export default router;
