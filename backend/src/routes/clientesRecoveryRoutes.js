import express from "express";
import clienteRecoveryController from "../controllers/clientesRecoveryController.js";

const router = express.Router();

router.route("/requestCode").post(clienteRecoveryController.requestCode)
router.route("/verifyCode").post(clienteRecoveryController.verifyCode)
router.route("/newPassword").post(clienteRecoveryController.newPassword)

export default router

