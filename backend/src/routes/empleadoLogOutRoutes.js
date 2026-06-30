import express from "express";
import logoutController from "../controllers/empleadoLogOutController.js";

const router = express.Router();

router.route("/").post(logoutController.logoutEmpleado);

export default router;

