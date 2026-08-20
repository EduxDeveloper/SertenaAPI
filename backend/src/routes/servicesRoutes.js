import express from "express";
import servicesController from "../controllers/servicesController.js";
import upload from "../utils/cloudinaryConfig.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

const router = express.Router();
const requireAdmin = validateAuthCookie("authAdminCookie", ["admin"]);

router.route("/")
    .get(servicesController.getServices)
    .post(requireAdmin, upload.single("image"), servicesController.createServices)

router
    .route("/:id")
    .put(requireAdmin, upload.single("image"), servicesController.updateServices)
    .delete(requireAdmin, servicesController.deleteServices);

export default router;
