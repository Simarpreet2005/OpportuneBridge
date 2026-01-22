import express from "express";
import { aiChatbot, getATSScore } from "../controllers/aiChat.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/chat").post(isAuthenticated, aiChatbot);
router.route("/ats").post(isAuthenticated, getATSScore);

export default router;
