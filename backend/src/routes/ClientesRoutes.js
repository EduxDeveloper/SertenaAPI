import { Router } from "express";
import clienteController from "../controllers/clientesController.js";

const router = Router();

router.post("/crear", clienteController.crearCliente);
router.get("/obtener", clienteController.obtenerClientes);
router.put("/actualizar/:id", clienteController.actualizarCliente);
router.delete("/eliminar/:id", clienteController.eliminarCliente);

export default router;