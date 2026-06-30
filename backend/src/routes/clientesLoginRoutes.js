import express from "express";
import clientesLoginController from "../controllers/clientesLoginController.js";

const router = express.Router();

router.route("/").post(clientesLoginController.login);

export default router;