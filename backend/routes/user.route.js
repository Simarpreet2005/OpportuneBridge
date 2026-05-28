import express from "express";
import { login, logout, register, updateProfile, getLeaderboard, getProfile, forgotPassword, resetPassword, googleLogin } from "../controllers/user.controller.js";
import { getSystemStats, getAllUsers, getAllCompanies } from "../controllers/admin.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import { multiUpload, singleUpload } from "../middleware/multer.js";
import { validateEnumField, validateObjectIdField, validateRequiredFields, validatePhoneNumber, validatePassword } from "../middleware/validate.js";
import asyncHandler from "../middleware/asyncHandler.js";

const router = express.Router();

router.route("/register").post(
    singleUpload,
    validateRequiredFields(["fullname", "email", "phoneNumber", "password", "role"]),
    validatePhoneNumber(),
    validatePassword(),
    validateEnumField("role", ["student", "recruiter", "admin", "superadmin"]),
    asyncHandler(register)
);
router.route("/login").post(
    validateRequiredFields(["email", "password", "role"]),
    validateEnumField("role", ["student", "recruiter", "admin", "superadmin"]),
    asyncHandler(login)
);
router.route("/logout").get(asyncHandler(logout));
router.route("/profile/update").post(isAuthenticated, multiUpload, asyncHandler(updateProfile));
router.route("/leaderboard").get(asyncHandler(getLeaderboard));
router.route("/me").get(isAuthenticated, asyncHandler(getProfile));
router.route("/forgot-password").post(validateRequiredFields(["email"]), asyncHandler(forgotPassword));
router.route("/reset-password/:token").post(validateRequiredFields(["password"]), validatePassword(), asyncHandler(resetPassword));
router.route("/google-login").post(validateRequiredFields(["googleToken"]), asyncHandler(googleLogin));

// Admin Routes
router.route("/admin/stats").get(isAuthenticated, isAdmin, asyncHandler(getSystemStats));
router.route("/admin/users").get(isAuthenticated, isAdmin, asyncHandler(getAllUsers));
router.route("/admin/companies").get(isAuthenticated, isAdmin, asyncHandler(getAllCompanies));

export default router;
