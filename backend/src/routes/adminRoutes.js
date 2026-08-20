import express from "express";
import adminController from "../controllers/adminController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

const router = express.Router();
const requireAdmin = validateAuthCookie("authAdminCookie", ["admin"]);

router.route("/")
    .get(requireAdmin, adminController.getAdmin);

router
    .route("/:id")
    .put(requireAdmin, adminController.updateAdmin)
    .delete(requireAdmin, adminController.deleteAdmin);

export default router;
