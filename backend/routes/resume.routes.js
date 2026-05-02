import express from "express";
import { Resume } from "../models/resume.model.js";
import { User } from "../models/user.model.js";
import { upload } from "../middlewares/upload.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/upload", isAuthenticated, upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume file is required" });
        }

        const resume = await Resume.create({
            user: req.id,
            fileUrl: `/uploads/${req.file.filename}`,
            originalFileName: req.file.originalname,
            title: req.file.originalname
        });

        await User.findByIdAndUpdate(req.id, {
            $push: { "profile.resumes": resume._id }
        });

        res.json(resume);
    } catch {
        res.status(500).json({ message: "Resume upload failed" });
    }
});

export default router;
