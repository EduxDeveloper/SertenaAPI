import express from "express";
import proyectsController from "../controllers/proyectsController.js";

const router = express.Router();

router.route("/")
    .get(proyectsController.getProyects)
    .post(proyectsController.InsertProyects)

router.route("/:id")
.put(proyectsController.updatProyects)
.delete(proyectsController.deleteProyects)

export default router;