import express from "express";
import clientesRegisterController from "../controllers/clientesRegisterController.js";

const router = express.Router();

router.route("/").post(clientesRegisterController.register);
router.route("/verifyCodeEmail").post(clientesRegisterController.verifyCode);

export default router;