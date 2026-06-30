import express from "express";
import clienteslogoutController from "../controllers/clientesLogOutController.js";

const router = express.Router();

router.route("/").post(clienteslogoutController.logoutCliente);

export default router;

