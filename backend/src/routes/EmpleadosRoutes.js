import { Router } from "express";
import empleadoController from "../controladores/EmpleadoController.js";

const router = Router();

router.post("/crear", empleadoController.crearEmpleado);
router.get("/obtener", empleadoController.obtenerEmpleados);
router.put("/actualizar/:id", empleadoController.actualizarEmpleado);
router.delete("/eliminar/:id", empleadoController.eliminarEmpleado);

export default router;
