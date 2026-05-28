import mongoose from "mongoose";

const readSource = (req, source) => req[source] || {};

export const validateRequiredFields = (fields, source = "body") => (req, res, next) => {
    const data = readSource(req, source);
    const missingFields = fields.filter((field) => {
        const value = data[field];
        return value === undefined || value === null || String(value).trim() === "";
    });

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Missing required field${missingFields.length > 1 ? "s" : ""}: ${missingFields.join(", ")}.`
        });
    }

    return next();
};

export const validateObjectIdParam = (paramName = "id") => (req, res, next) => {
    const value = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({
            success: false,
            message: `Invalid ${paramName}.`
        });
    }

    return next();
};

export const validateObjectIdField = (fieldName, source = "body") => (req, res, next) => {
    const value = readSource(req, source)[fieldName];

    if (!mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({
            success: false,
            message: `Invalid ${fieldName}.`
        });
    }

    return next();
};

export const validateEnumField = (field, allowedValues, source = "body") => (req, res, next) => {
    const value = readSource(req, source)[field];

    if (!allowedValues.includes(value)) {
        return res.status(400).json({
            success: false,
            message: `${field} must be one of: ${allowedValues.join(", ")}.`
        });
    }

    return next();
};

export const validatePhoneNumber = (field = "phoneNumber", source = "body") => (req, res, next) => {
    const value = readSource(req, source)[field];
    const phoneStr = String(value);
    
    if (phoneStr.length < 10) {
        return res.status(400).json({
            success: false,
            message: `${field} must be at least 10 digits.`
        });
    }

    return next();
};

export const validatePassword = (field = "password", source = "body") => (req, res, next) => {
    const value = readSource(req, source)[field];
    
    if (!value || value.length < 8) {
        return res.status(400).json({
            success: false,
            message: `${field} must be at least 8 characters long.`
        });
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (!hasUpperCase) {
        return res.status(400).json({
            success: false,
            message: `${field} must contain at least 1 uppercase letter.`
        });
    }

    if (!hasLowerCase) {
        return res.status(400).json({
            success: false,
            message: `${field} must contain at least 1 lowercase letter.`
        });
    }

    if (!hasNumber) {
        return res.status(400).json({
            success: false,
            message: `${field} must contain at least 1 number.`
        });
    }

    if (!hasSpecial) {
        return res.status(400).json({
            success: false,
            message: `${field} must contain at least 1 special character.`
        });
    }

    return next();
};
