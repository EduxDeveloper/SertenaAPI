import express from "express";
import servicesController from "../controllers/servicesController.js";
import upload from "../utils/cloudinaryConfig.js";

const router = express.Router();

router.route("/")
    .get(servicesController.getServices)
    .post(upload.single("image"), servicesController.createServices)

router
    .route("/:id")
    .put(upload.single("image"), servicesController.updateServices)
    .delete(servicesController.deleteServices);

export default router;