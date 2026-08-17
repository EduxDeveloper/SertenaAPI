import express from "express";
import clientesRegisterController from "../controllers/clientesRegisterController.js";
import limiter from "../middlewares/limiter.js";

const router = express.Router();

router.route("/").post(limiter, clientesRegisterController.register);
router.route("/verifyCodeEmail").post(limiter, clientesRegisterController.verifyCode);

export default router;