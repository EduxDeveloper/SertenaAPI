import clienteModel from "../models/clientesModel.js";
import bcrypt from "bcryptjs";

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

clienteController.eliminarCliente = async (req, res) => {
  try {
    const clienteEliminado = await clienteModel.findByIdAndDelete(req.params.id);

    if (!clienteEliminado) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    return res.status(200).json({ message: "Cliente eliminado" });
  } catch (error) {
    console.log("error " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

clienteController.actualizarCliente = async (req, res) => {
  try {
    let { nombre, email, contraseña, tipo, isVerified } = req.body;

    nombre = nombre?.trim();
    email = email?.trim();

    if (!nombre || !email) {
      return res.status(400).json({ message: "Nombre y email son requeridos" });
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