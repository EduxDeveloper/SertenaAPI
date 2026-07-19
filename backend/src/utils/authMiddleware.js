import jwt from "jsonwebtoken";
import { config } from "../../config.js";

export const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.authClienteCookie;

        if (!token) {
            return res.status(401).json({ message: "No token provided, authorization denied" });
        }

        const decoded = jwt.verify(token, config.JWT.secret);
        req.userId = decoded.id;
        req.userType = decoded.userType;
        
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Invalid token" });
    }
};
