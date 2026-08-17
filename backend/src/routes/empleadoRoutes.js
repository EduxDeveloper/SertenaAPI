import { Router } from "express";
import empleadoController from "../controllers/empleadoController.js";
import { verifyAdminToken, verifyStaffToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/crear", verifyAdminToken, empleadoController.crearEmpleado);
router.get("/obtener", verifyStaffToken, empleadoController.obtenerEmpleados);
router.get("/paginado", verifyAdminToken, empleadoController.obtenerEmpleadosPaginados);
router.put("/actualizar/:id", verifyAdminToken, empleadoController.actualizarEmpleado);
router.delete("/eliminar/:id", verifyAdminToken, empleadoController.eliminarEmpleado);

export default router;