import { logger } from "../utils/logger.js";

const getStatusCode = (error) => {
    if (error?.statusCode) return error.statusCode;
    if (error?.status) return error.status;
    if (error?.name === "CastError") return 400;
    if (error?.name === "ValidationError") return 400;
    if (error?.type === "entity.parse.failed") return 400;
    return 500;
};

const getMessage = (error, statusCode) => {
    if (error?.type === "entity.parse.failed") return "Request body contains invalid JSON.";
    if (error?.name === "CastError") return "Invalid resource id.";
    if (error?.name === "ValidationError") {
        return Object.values(error.errors || {})
            .map((validationError) => validationError.message)
            .filter(Boolean)
            .join(", ") || "Validation failed.";
    }
    if (statusCode >= 500) return "Internal server error";
    return error?.message || "Request failed";
};

export const notFoundHandler = (req, res) => {
    return res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = getStatusCode(error);
    const message = getMessage(error, statusCode);

    // Only log unexpected server crashes (5xx). Expected client errors (4xx) are silent.
    if (statusCode >= 500) {
        logger.error(message, {
            method: req.method,
            path: req.originalUrl,
            statusCode
        });
    }

    return res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" ? { error: error?.message, stack: error?.stack } : {})
    });
};
