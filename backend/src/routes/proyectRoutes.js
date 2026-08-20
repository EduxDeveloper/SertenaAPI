import express from "express";
import proyectsController from "../controllers/proyectsController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

const router = express.Router();
const requireClient = validateAuthCookie("authClienteCookie", ["client"]);
const requireAdmin = validateAuthCookie("authAdminCookie", ["admin"]);
const requireStaff = validateAuthCookie(
    ["authAdminCookie", "authEmpleadoCookie"],
    ["admin", "employee"],
);

router.route("/")
    .get(requireStaff, proyectsController.getProyects)
    .post(requireClient, proyectsController.insertProyects)

router.get("/paginado", requireAdmin, proyectsController.getProyectsPaginated)
router.get("/mis-citas", requireClient, proyectsController.getMyProyects)

router.route("/:id")
    .put(requireStaff, proyectsController.updateProyects)
    .delete(requireAdmin, proyectsController.deleteProyects)

router.route("/searchByDate")
    .post(requireAdmin, proyectsController.searchByDate)

export default router;
