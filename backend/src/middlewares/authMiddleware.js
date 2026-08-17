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

export const verifyAdminToken = (req, res, next) => {
    try {
        const token = req.cookies.authAdminCookie;
        if (!token) {
            return res.status(401).json({ message: "Sesión de administrador requerida." });
        }

        const decoded = jwt.verify(token, config.JWT.secret);
        if (decoded.userType !== "admin" || !decoded.id) {
            return res.status(403).json({ message: "No tienes permisos para esta acción." });
        }

        req.adminId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "La sesión de administrador no es válida." });
    }
};
