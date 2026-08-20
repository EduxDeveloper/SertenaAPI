import { Router } from "express";
import clienteController from "../controllers/ClientesController.js";
import upload from "../utils/cloudinaryConfig.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

const router = Router();
const requireAdmin = validateAuthCookie("authAdminCookie", ["admin"]);
const requireClientOrAdmin = validateAuthCookie(
    ["authClienteCookie", "authAdminCookie"],
    ["client", "admin"],
);
const requireClient = validateAuthCookie("authClienteCookie", ["client"]);

router.post("/crear", clienteController.crearCliente);
router.get("/obtener", requireAdmin, clienteController.obtenerClientes);
router.get("/perfil", requireClient, clienteController.obtenerPerfil);
router.get("/paginado", requireAdmin, clienteController.obtenerClientesPaginados);
router.put("/actualizar/:id", requireClientOrAdmin, upload.single("image"), clienteController.actualizarCliente);
router.delete("/eliminar/:id", requireClientOrAdmin, clienteController.eliminarCliente);

export default router;
