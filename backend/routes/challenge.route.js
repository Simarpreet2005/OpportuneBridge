import express from "express";
import { createChallenge, getChallengeById, getChallenges } from "../controllers/challenge.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/").post(isAuthenticated, createChallenge);
router.route("/").get(getChallenges);
router.route("/:id").get(getChallengeById);

export default router;
