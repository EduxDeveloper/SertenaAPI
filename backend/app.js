import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import openapiDocument from "./src/docs/openapi.js";
//Rutas de Administrador
import adminRoutes from "./src/routes/adminRoutes.js";
import adminRecoveryRoutes from "./src/routes/adminRecoveryRoutes.js";
import adminLoginRoutes from "./src/routes/adminLoginRoutes.js"
import adminLogoutRoutes from "./src/routes/adminLogoutRoutes.js";
import adminSettingsRoutes from "./src/routes/adminSettingsRoutes.js";
//Rutas de servicios
import servicesRoutes from "./src/routes/servicesRoutes.js";
//Ruta de citas/proyectos
import proyectRoutes from "./src/routes/proyectRoutes.js";
//Rutas de clientes
import clientesRoutes from "./src/routes/clientesRoutes.js";
import clientesLoginRoutes from "./src/routes/clientesLoginRoutes.js"
import clientesLogOutRoutes from "./src/routes/clientesLogoutRoutes.js"
import clientesRecoveryRoutes from "./src/routes/clientesRecoveryRoutes.js"
import clientesRegisterRoutes from "./src/routes/clientesRegisterRoutes.js"
//Rutas de empleados
import empleadoRoutes from "./src/routes/empleadoRoutes.js";
import empleadosRecoveryRoutes from "./src/routes/empleadoRecoveryRoutes.js";
import empleadosLoginRoutes from "./src/routes/empleadoLoginRoutes.js";
import empleadosLogOutRoutes from "./src/routes/empleadoLogOutRoutes.js";
//Rutas de reviews
import reviewsRoutes from "./src/routes/reviewsRoutes.js";

const app = express();

const localOrigins = ["http://localhost:5173", "http://localhost:5174"];
const configuredOrigins = (process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedOrigins = new Set([...localOrigins, ...configuredOrigins]);

app.set("trust proxy", 1);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.has(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
    }),
);

app.use(cookieParser());

//Para que la API acepte json
app.use(express.json());

app.get("/api/openapi.json", (_req, res) => {
    res.json(openapiDocument);
});

app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument, {
        customSiteTitle: "SERTENA API — Documentación",
        explorer: true,
    }),
);

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

//Rutas para Administrador
app.use("/api/admin", adminRoutes);
app.use("/api/adminRecovery", adminRecoveryRoutes);
app.use("/api/adminLogin", adminLoginRoutes);
app.use("/api/adminLogout", adminLogoutRoutes);
app.use("/api/adminSettings", adminSettingsRoutes);
//Ruta para servicios
app.use("/api/services", servicesRoutes);
//citas/proyectos
app.use("/api/proyects", proyectRoutes);
//Ruta para clientes
app.use("/api/clientes", clientesRoutes);
app.use("/api/clienteRecovery", clientesRecoveryRoutes);
app.use("/api/loginCliente", clientesLoginRoutes);
app.use("/api/logoutCliente", clientesLogOutRoutes);
app.use("/api/registerCliente", clientesRegisterRoutes);


//Rutas para empleados
app.use("/api/empleados", empleadoRoutes);
app.use("/api/empleadoRecovery", empleadosRecoveryRoutes);
app.use("/api/loginEmpleado", empleadosLoginRoutes);
app.use("/api/logoutEmpleado", empleadosLogOutRoutes);
//Ruta para reviews
app.use("/api/reviews", reviewsRoutes);

export default app;
