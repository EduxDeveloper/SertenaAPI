import express from "express";
import loginAdminController from "../controllers/adminLoginController.js";
import limiter from "../middlewares/limiter.js";

const router = express.Router();

router.route("/").post(limiter, loginAdminController.login);

export default router;