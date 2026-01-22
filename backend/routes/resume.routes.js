import express from "express";
import { Resume } from "../models/resume.model.js";
import { User } from "../models/user.model.js";
import { upload } from "../middlewares/upload.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/upload", isAuthenticated, upload.single("resume"), async (req, res) => {
    try {
        const resume = await Resume.create({
            userId: req.user.id,
            fileUrl: `/uploads/${req.file.filename}`,
            parsedText: "",
            atsScore: 0,
            missingSkills: []
        });

        await User.findByIdAndUpdate(req.user.id, {
            $push: { resumes: resume._id }
        });

        res.json(resume);
    } catch {
        res.status(500).json({ message: "Resume upload failed" });
    }
});

export default router;
