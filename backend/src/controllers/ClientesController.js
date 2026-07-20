import clienteModel from "../models/clientesModel.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

const clienteController = {};

clienteController.crearCliente = async (req, res) => {
  try {
    let { nombre, email, contraseña, tipo, isVerified } = req.body;

    nombre = nombre?.trim();
    email = email?.trim();
    contraseña = contraseña?.trim();

    if (!nombre || !email || !contraseña) {
      return res.status(400).json({ message: "Todos los campos son requeridos" });
    }

    const clienteExiste = await clienteModel.findOne({ email });
    if (clienteExiste) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const contraseñaHasheada = await bcrypt.hash(contraseña, salt);

    const nuevoCliente = new clienteModel({
      nombre,
      email,
      contraseña: contraseñaHasheada,
      tipo: tipo || "persona",
      isVerified: isVerified || false
    });

    await nuevoCliente.save();
    return res.status(201).json({ message: "Cliente creado con éxito", data: nuevoCliente });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

clienteController.obtenerClientes = async (req, res) => {
  try {
    const clientes = await clienteModel.find();
    return res.status(200).json(clientes);
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

clienteController.obtenerClientesPaginados = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const clientes = await clienteModel.find().skip(skip).limit(limit);
    const total = await clienteModel.countDocuments();

    return res.status(200).json({
      data: clientes,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

clienteController.eliminarCliente = async (req, res) => {
  try {
    // Validar autorización: el ID debe coincidir con el token, o ser admin
    if (req.userId !== req.params.id && req.userType !== "admin") {
      return res.status(403).json({ message: "No autorizado para eliminar esta cuenta" });
    }

    const clienteFound = await clienteModel.findById(req.params.id);
    if (!clienteFound) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Eliminar la imagen de Cloudinary si existe
    if (clienteFound.public_id) {
      await cloudinary.uploader.destroy(clienteFound.public_id);
    }

    await clienteModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Cliente eliminado" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

clienteController.actualizarCliente = async (req, res) => {
  try {
    // Validar autorización
    if (req.userId !== req.params.id && req.userType !== "admin") {
      return res.status(403).json({ message: "No autorizado para actualizar esta cuenta" });
    }

    let { nombre, email, tipo, isVerified } = req.body;
    let contraseña = req.body.contraseña || req.body.password;

    nombre = nombre?.trim();
    email = email?.trim();

    if (!nombre || !email) {
      return res.status(400).json({ message: "Nombre y email son requeridos" });
    }

    const clienteFound = await clienteModel.findById(req.params.id);
    if (!clienteFound) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    const camposActualizar = {
      nombre,
      email,
      tipo,
      isVerified
    };

    if (contraseña) {
      contraseña = contraseña.trim();
      if (contraseña !== "") {
        const salt = await bcrypt.genSalt(10);
        camposActualizar.contraseña = await bcrypt.hash(contraseña, salt);
      }
    }

    // Si viene alguna imagen
    if (req.file) {
      // Eliminar la imagen anterior si existe
      if (clienteFound.public_id) {
        await cloudinary.uploader.destroy(clienteFound.public_id);
      }

      // Guardar la nueva imagen
      camposActualizar.fotoPerfil = req.file.path;
      camposActualizar.public_id = req.file.filename;
    }

    const clienteActualizado = await clienteModel.findByIdAndUpdate(
      req.params.id,
      camposActualizar,
      { new: true }
    );

    if (!clienteActualizado) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    return res.status(200).json({ message: "Cliente actualizado", data: clienteActualizado });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default clienteController;