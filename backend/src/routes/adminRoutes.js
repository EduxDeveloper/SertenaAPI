import express from "express";
import adminController from "../controllers/adminController.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(verifyAdminToken, adminController.getAdmin);

router
    .route("/:id")
    .put(verifyAdminToken, adminController.updateAdmin)
    .delete(verifyAdminToken, adminController.deleteAdmin);

export default router;