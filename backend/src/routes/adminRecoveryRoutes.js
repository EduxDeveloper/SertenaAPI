import express from "express";
import recoveryPasswordController from "../controllers/adminRecoveryController.js";
import limiter from "../middlewares/limiter.js";

const router = express.Router();

router.route("/requestCode").post(limiter, recoveryPasswordController.requestCode)
router.route("/verifyCode").post(limiter, recoveryPasswordController.verifyCode)
router.route("/newPassword").post(recoveryPasswordController.newPassword)

export default router