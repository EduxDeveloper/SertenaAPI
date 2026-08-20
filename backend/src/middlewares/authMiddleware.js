import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";

/**
 * Valida una cookie de autenticación y el rol incluido en su JWT.
 *
 * El primer argumento debe coincidir exactamente con el nombre de la cookie
 * creada por el login: authAdminCookie, authClienteCookie o authEmpleadoCookie.
 * Para rutas compartidas se puede enviar un arreglo de cookies y de roles.
 *
 * Ejemplos:
 * validateAuthCookie("authAdminCookie", ["admin"])
 * validateAuthCookie(["authAdminCookie", "authEmpleadoCookie"], ["admin", "employee"])
 */
export const validateAuthCookie = (cookieNames, allowedTypes = []) => {
    const acceptedCookies = Array.isArray(cookieNames) ? cookieNames : [cookieNames];
    const acceptedRoles = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];

    return (req, res, next) => {
        try {
            const cookieName = acceptedCookies.find((name) => req.cookies?.[name]);
            // Las webs usan la cookie HttpOnly. React Native no dispone de un
            // almacén de cookies fiable entre reinicios, por lo que la app móvil
            // envía el mismo JWT mediante Authorization: Bearer <token>.
            const bearerToken = req.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
            const authCookie = cookieName ? req.cookies[cookieName] : bearerToken;

            if (!authCookie) {
                return res.status(403).json({ message: "Authentication required" });
            }

            const decoded = jsonwebtoken.verify(authCookie, config.JWT.secret);

            if (!acceptedRoles.includes(decoded.userType)) {
                return res.status(401).json({ message: "Access denied" });
            }

            // Conserva los datos que ya utilizan los controladores de SERTENA.
            req.userId = decoded.id;
            req.userType = decoded.userType;
            req.authCookieName = cookieName;

            if (decoded.userType === "admin") {
                req.adminId = decoded.id;
                req.staffId = decoded.id;
                req.staffType = "admin";
            }

            if (decoded.userType === "employee") {
                req.empleadoId = decoded.id;
                req.staffId = decoded.id;
                req.staffType = "employee";
            }

            return next();
        } catch (error) {
            console.error("Authentication error:", error.message);
            return res.status(401).json({ message: "Invalid or expired session" });
        }
    };
};
