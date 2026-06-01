import express from "express";
import logoutController from "../controllers/adminLogoutController.js";

const router = express.Router();

router.route("/").post(logoutController.logoutAdmin);

export default router;

