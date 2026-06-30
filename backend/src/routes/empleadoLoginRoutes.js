import express from "express";
import loginEmpleadoController from "../controllers/empleadosLoginController.js";

const router = express.Router();

router.route("/").post(loginEmpleadoController.login);

export default router;