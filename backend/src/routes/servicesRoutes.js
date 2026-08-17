import express from "express";
import servicesController from "../controllers/servicesController.js";
import upload from "../utils/cloudinaryConfig.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(servicesController.getServices)
    .post(verifyAdminToken, upload.single("image"), servicesController.createServices)

router
    .route("/:id")
    .put(verifyAdminToken, upload.single("image"), servicesController.updateServices)
    .delete(verifyAdminToken, servicesController.deleteServices);

export default router;