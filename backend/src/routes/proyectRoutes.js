import express from "express";
import proyectsController from "../controllers/proyectsController.js";
import { verifyToken, verifyAdminToken, verifyStaffToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(verifyStaffToken, proyectsController.getProyects)
    .post(verifyToken, proyectsController.insertProyects)

router.get("/paginado", verifyAdminToken, proyectsController.getProyectsPaginated)

router.route("/:id")
    .put(verifyStaffToken, proyectsController.updateProyects)
    .delete(verifyAdminToken, proyectsController.deleteProyects)

router.route("/searchByDate")
    .post(verifyAdminToken, proyectsController.searchByDate)

export default router;