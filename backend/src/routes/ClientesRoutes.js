import { Router } from "express";
import clienteController from "../controllers/clientesController.js";
import upload from "../utils/cloudinaryConfig.js";
import { verifyToken } from "../utils/authMiddleware.js";

const router = Router();

router.post("/crear", clienteController.crearCliente);
router.get("/obtener", clienteController.obtenerClientes);
router.put("/actualizar/:id", verifyToken, upload.single("image"), clienteController.actualizarCliente);
router.delete("/eliminar/:id", verifyToken, clienteController.eliminarCliente);

export default router;