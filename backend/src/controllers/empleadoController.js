import empleadoModel from "../models/empleadoModel.js";
import bcrypt from "bcryptjs";

const empleadoController = {};

empleadoController.crearEmpleado = async (req, res) => {
    try {
        let { nombre, apellido, email, contraseña, salario, status = true, services } = req.body;

        nombre = nombre?.trim();
        apellido = apellido?.trim();
        email = email?.trim();
        contraseña = contraseña?.trim();

        if (!nombre || !apellido || !email || !contraseña || !salario) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        const empleadoExiste = await empleadoModel.findOne({ email });
        if (empleadoExiste) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const contraseñaHasheada = await bcrypt.hash(contraseña, salt);

        const nuevoEmpleado = new empleadoModel({
            nombre,
            apellido,
            email,
            contraseña: contraseñaHasheada,
            salario,
            status: status === true,
            services: services || []
        });

        await nuevoEmpleado.save();
        return res.status(201).json({ message: "Empleado creado con éxito", data: nuevoEmpleado });
    } catch (error) {
        console.log("error " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

empleadoController.obtenerEmpleados = async (req, res) => {
    try {
        const empleados = await empleadoModel.find().populate("services", "nameService");
        return res.status(200).json(empleados);
    } catch (error) {
        console.log("error " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

empleadoController.obtenerEmpleadosPaginados = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const skip = (page - 1) * limit;

        const empleados = await empleadoModel.find().populate("services", "nameService").skip(skip).limit(limit);
        const total = await empleadoModel.countDocuments();

        return res.status(200).json({
            data: empleados,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.log("error " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

empleadoController.eliminarEmpleado = async (req, res) => {
    try {
        const empleadoEliminado = await empleadoModel.findByIdAndDelete(req.params.id);

        if (!empleadoEliminado) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }

        return res.status(200).json({ message: "Empleado eliminado" });
    } catch (error) {
        console.log("error " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

empleadoController.actualizarEmpleado = async (req, res) => {
    try {
        let { nombre, apellido, email, contraseña, salario, status, services } = req.body;

        nombre = nombre?.trim();
        apellido = apellido?.trim();
        email = email?.trim();

        if (!nombre || !apellido || !email || !salario) {
            return res.status(400).json({ message: "Nombre, apellido, email y salario son requeridos" });
        }

        const camposActualizar = {
            nombre,
            apellido,
            email,
            salario,
            services
        };

        if (typeof status === "boolean") {
            camposActualizar.status = status;
        }

        if (contraseña) {
            contraseña = contraseña.trim();
            if (contraseña !== "") {
                const salt = await bcrypt.genSalt(10);
                camposActualizar.contraseña = await bcrypt.hash(contraseña, salt);
            }
        }

        const empleadoActualizado = await empleadoModel.findByIdAndUpdate(
            req.params.id,
            camposActualizar,
            { new: true }
        );

        if (!empleadoActualizado) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }

        return res.status(200).json({ message: "Empleado actualizado", data: empleadoActualizado });
    } catch (error) {
        console.log("error " + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default empleadoController;
