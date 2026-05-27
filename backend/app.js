import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//Rutas de Usuarios
import adminRoutes from "./src/routes/adminRoutes.js"

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
app.use("/api/admin", adminRoutes);


export default app;