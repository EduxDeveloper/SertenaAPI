import { Router } from "express";
import empleadoController from "../controllers/empleadoController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

const router = Router();
const requireAdmin = validateAuthCookie("authAdminCookie", ["admin"]);
const requireStaff = validateAuthCookie(
    ["authAdminCookie", "authEmpleadoCookie"],
    ["admin", "employee"],
);

router.post("/crear", requireAdmin, empleadoController.crearEmpleado);
router.get("/obtener", requireStaff, empleadoController.obtenerEmpleados);
router.get("/paginado", requireAdmin, empleadoController.obtenerEmpleadosPaginados);
router.put("/actualizar/:id", requireAdmin, empleadoController.actualizarEmpleado);
router.delete("/eliminar/:id", requireAdmin, empleadoController.eliminarEmpleado);

export default router;
