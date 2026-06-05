import express from "express";
import proyectsController from "../controllers/proyectsController.js";

const router = express.Router();

router.route("/")
    .get(proyectsController.getProyects)
    .post(proyectsController.insertProyects)

router.route("/:id")
.put(proyectsController.updateProyects)
.delete(proyectsController.deleteProyects)

export default router;