import multer from "multer";
import { logger } from "../utils/logger.js";

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        logger.info("Multer file filter", { mimetype: file.mimetype, originalname: file.originalname });
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            logger.error("Invalid file type", { mimetype: file.mimetype, allowed: Array.from(ALLOWED_MIME_TYPES) });
            return cb(new Error("Invalid file type"));
        }
        return cb(null, true);
    }
});

export const singleUpload = (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            logger.error("Multer singleUpload error", { error: err.message, code: err.code });
            return res.status(400).json({
                message: err.message === "Invalid file type" 
                    ? "Invalid file type. Allowed: JPEG, PNG, WebP, PDF, DOC, DOCX" 
                    : err.code === "LIMIT_FILE_SIZE" 
                    ? "File size exceeds 10MB limit" 
                    : "File upload failed",
                success: false
            });
        }
        logger.info("Multer singleUpload success", { 
            hasFile: !!req.file, 
            filename: req.file?.originalname,
            size: req.file?.size,
            mimetype: req.file?.mimetype
        });
        next();
    });
};

export const multiUpload = (req, res, next) => {
    upload.fields([
        { name: "profilePhoto", maxCount: 1 },
        { name: "resume", maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            logger.error("Multer multiUpload error", { error: err.message, code: err.code });
            return res.status(400).json({
                message: err.message === "Invalid file type" 
                    ? "Invalid file type. Allowed: JPEG, PNG, WebP, PDF, DOC, DOCX" 
                    : err.code === "LIMIT_FILE_SIZE" 
                    ? "File size exceeds 10MB limit" 
                    : "File upload failed",
                success: false
            });
        }
        logger.info("Multer multiUpload success", { 
            files: req.files ? Object.keys(req.files) : [],
            profilePhoto: req.files?.profilePhoto?.[0]?.originalname,
            resume: req.files?.resume?.[0]?.originalname
        });
        next();
    });
};
