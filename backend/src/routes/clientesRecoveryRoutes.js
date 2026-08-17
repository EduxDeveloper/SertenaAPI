import express from "express";
import clienteRecoveryController from "../controllers/clientesRecoveryController.js";
import limiter from "../middlewares/limiter.js";

const router = express.Router();

router.route("/requestCode").post(limiter, clienteRecoveryController.requestCode)
router.route("/verifyCode").post(limiter, clienteRecoveryController.verifyCode)
router.route("/newPassword").post(clienteRecoveryController.newPassword)

export default router