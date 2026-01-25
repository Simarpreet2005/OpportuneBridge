import jwt from "jsonwebtoken";

const isSuperAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            })
        }
        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        if (!decode) {
            return res.status(401).json({
                message: "Invalid token",
                success: false
            })
        };
        req.id = decode.userId;

  
        const { User } = await import("../models/user.model.js");
        const user = await User.findById(req.id);

        if (!user || user.role !== 'superadmin') {
            return res.status(403).json({
                message: "Access denied. Super Admin only.",
                success: false
            });
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}

export default isSuperAdmin;
