import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//Rutas de Administrador
import adminRoutes from "./src/routes/adminRoutes.js";
import adminRecoveryRoutes from "./src/routes/adminRecoveryRoutes.js";
import adminLoginRoutes from "./src/routes/adminLoginRoutes.js"
import adminLogoutRoutes from "./src/routes/adminLogoutRoutes.js";
//Rutas de servicios
import servicesRoutes from "./src/routes/servicesRoutes.js";

const app = express();

app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        //permitir el envío de cookies y credenciales
        credentials: true,
    }),
);

app.use(cookieParser());

//Para que la API acepte json
app.use(express.json());

//Rutas para Administrador
app.use("/api/admin", adminRoutes);
app.use("/api/adminRecovery", adminRecoveryRoutes);
app.use("/api/adminLogin", adminLoginRoutes);
app.use("/api/adminLogout", adminLogoutRoutes);
//Ruta para servicios
app.use("/api/services", servicesRoutes);

export default app;