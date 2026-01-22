import { Post } from "../models/post.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";

export const createPost = async (req, res) => {
    try {
        const userId = req.id;
        const { content } = req.body;
        const file = req.file;

        if (!content && !file) {
            return res.status(400).json({ message: "Content or Image is required", success: false });
        }

        let cloudResponse;
        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        const post = await Post.create({
            author: userId,
            content: content || "",
            image: cloudResponse ? cloudResponse.secure_url : ""
        });

        await post.populate({ path: 'author', select: 'fullname profile.profilePhoto' });

        return res.status(201).json({
            message: "Post created successfully.",
            post,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'fullname profile.profilePhoto' })
            .populate({ path: 'comments.user', select: 'fullname profile.profilePhoto' });

        return res.status(200).json({
            posts,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const likePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found", success: false });

        const isLiked = post.likes.includes(userId);
        if (isLiked) {
            // Unlike
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            return res.status(200).json({ message: "Post unliked", success: true });
        } else {
            // Like
            await Post.updateOne({ _id: postId }, { $addToSet: { likes: userId } });
            return res.status(200).json({ message: "Post liked", success: true });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const addComment = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.postId;
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Comment text required", success: false });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found", success: false });

        post.comments.push({ user: userId, text });
        await post.save();

        await post.populate({ path: 'comments.user', select: 'fullname profile.profilePhoto' });

        return res.status(201).json({
            message: "Comment added",
            comments: post.comments,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}
