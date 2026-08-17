import express from "express";
import clientesLoginController from "../controllers/clientesLoginController.js";
import limiter from "../middlewares/limiter.js";

const router = express.Router();

router.route("/").post(limiter, clientesLoginController.login);

export default router;