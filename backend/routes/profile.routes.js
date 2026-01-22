import express from "express";
import { User } from "../models/user.model.js";
import { upload } from "../middlewares/upload.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/upload-pic", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePic: `/uploads/${req.file.filename}` },
            { new: true }
        );

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Upload failed" });
    }
});

export default router;
