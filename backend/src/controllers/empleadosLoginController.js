import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

import { config } from "../../config.js";
import { cookieOptions } from "../utils/cookieOptions.js";

import EmpleadosModel from "../models/empleadoModel.js";

//Array de funciones
const empleadosLoginController = {};

empleadosLoginController.login = async (req, res) => {
    try {
        //#1- Solicitar los datos
        let { email, password } = req.body;
        if (!password) password = req.body.contraseña;

        if (!email || !password) {
            return res.status(400).json({ message: "Email y contraseña son requeridos" });
        }

        email = email.trim();

        //Verificar si el correo existe en la base de datos (insensible a mayúsculas)
        const empleadoFound = await EmpleadosModel.findOne({
            email: { $regex: new RegExp(`^${email}$`, "i") }
        });

        //Si no existe el correo
        if (!empleadoFound) {
            return res.status(400).json({ message: "Employee not found" });
        }

        // Obtener la contraseña almacenada soportando tanto password como contraseña
        const storedPassword = empleadoFound.password || empleadoFound.contraseña;
        if (!storedPassword) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        //Validar la contraseña
        const isMatch = await bcrypt.compare(password, storedPassword);

        // No se debe crear una sesión si la contraseña no coincide.
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        // Si faltaba alguno de los campos de contraseña en MongoDB, curarlo para que ambos existan
        if (!empleadoFound.password || !empleadoFound.contraseña) {
            empleadoFound.password = storedPassword;
            empleadoFound.contraseña = storedPassword;
            await empleadoFound.save().catch(() => {});
        }

        //Generar el token
        const token = jsonwebtoken.sign(
            //#1- ¿que vamos a guardar?
            { id: empleadoFound._id, userType: "employee" },
            //#2- secret key
            config.JWT.secret,
            //#3- Cuando expira
            { expiresIn: "30d" },
        );

        //El token lo guardamos en una cookie
        res.cookie("authEmpleadoCookie", token, cookieOptions(30 * 24 * 60 * 60 * 1000));

        return res.status(200).json({
            message: "Login successfully",
            user: {
                id: empleadoFound._id,
                _id: empleadoFound._id,
                email: empleadoFound.email,
                nombre: empleadoFound.nombre || empleadoFound.name,
                apellido: empleadoFound.apellido || empleadoFound.lastName,
                salary: empleadoFound.salary || empleadoFound.salario,
                status: empleadoFound.status,
                userType: "employee",
                role: "employee"
            }
        });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default empleadosLoginController;
