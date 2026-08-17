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

export const verifyEmpleadoToken = (req, res, next) => {
    try {
        const token = req.cookies.authEmpleadoCookie;
        if (!token) {
            return res.status(401).json({ message: "Sesión de empleado requerida." });
        }

        const decoded = jwt.verify(token, config.JWT.secret);
        if (decoded.userType !== "employee" || !decoded.id) {
            return res.status(403).json({ message: "No tienes permisos para esta acción." });
        }

        req.empleadoId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "La sesión de empleado no es válida." });
    }
};

// Permite el paso a admin O empleado. Usar solo en endpoints que
// ambos roles necesitan (ej. ver/actualizar citas).
export const verifyStaffToken = (req, res, next) => {
    try {
        const token = req.cookies.authAdminCookie || req.cookies.authEmpleadoCookie;

        if (!token) {
            return res.status(401).json({ message: "Sesión requerida." });
        }

        const decoded = jwt.verify(token, config.JWT.secret);
        if (!["admin", "employee"].includes(decoded.userType) || !decoded.id) {
            return res.status(403).json({ message: "No tienes permisos para esta acción." });
        }

        req.staffId = decoded.id;
        req.staffType = decoded.userType;
        next();
    } catch (error) {
        return res.status(401).json({ message: "La sesión no es válida." });
    }
};