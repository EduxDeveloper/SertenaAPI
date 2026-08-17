import express from "express";
import empleadoRecoveryController from "../controllers/empleadosRecoveryController.js";
import limiter from "../middlewares/limiter.js";

const router = express.Router();

router.route("/requestCode").post(limiter, empleadoRecoveryController.requestCode)
router.route("/verifyCode").post(limiter, empleadoRecoveryController.verifyCode)
router.route("/newPassword").post(empleadoRecoveryController.newPassword)

export default router