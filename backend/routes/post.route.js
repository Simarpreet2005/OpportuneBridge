import express from "express";
import { createPost, getAllPosts, likePost, addComment, deletePost } from "../controllers/post.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/").post(isAuthenticated, singleUpload, createPost);
router.route("/").get(isAuthenticated, getAllPosts); // Requiring auth for feed now, safer
router.route("/:postId/like").post(isAuthenticated, likePost);
router.route("/:postId/comment").post(isAuthenticated, addComment);
router.route("/:postId").delete(isAuthenticated, deletePost);

export default router;
