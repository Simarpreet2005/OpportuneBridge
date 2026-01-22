import express from "express";
import { login, logout, register, updateProfile, getLeaderboard, getProfile, checkATSScore, forgotPassword, resetPassword, googleLogin } from "../controllers/user.controller.js";
import { getSystemStats, getAllUsers, getAllCompanies } from "../controllers/admin.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isSuperAdmin from "../middlewares/isSuperAdmin.js";
import { mutliUpload, singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated, mutliUpload, updateProfile);
router.route("/leaderboard").get(getLeaderboard);
router.route("/me").get(isAuthenticated, getProfile);
router.route("/ats-score").post(isAuthenticated, checkATSScore);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/google-login").post(googleLogin);

// Super Admin Routes
router.route("/admin/stats").get(isAuthenticated, isSuperAdmin, getSystemStats);
router.route("/admin/users").get(isAuthenticated, isSuperAdmin, getAllUsers);
router.route("/admin/companies").get(isAuthenticated, isSuperAdmin, getAllCompanies);

export default router;
