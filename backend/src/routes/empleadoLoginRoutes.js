import express from "express";
import loginEmpleadoController from "../controllers/empleadosLoginController.js";
import limiter from "../middlewares/limiter.js";

const router = express.Router();

router.route("/").post(limiter, loginEmpleadoController.login);

export default router;