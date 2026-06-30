import express from "express";
import empleadoRecoveryController from "../controllers/empleadosRecoveryController.js";

const router = express.Router();

router.route("/requestCode").post(empleadoRecoveryController.requestCode)
router.route("/verifyCode").post(empleadoRecoveryController.verifyCode)
router.route("/newPassword").post(empleadoRecoveryController.newPassword)

export default router

