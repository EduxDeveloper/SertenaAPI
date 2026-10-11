import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

import { config } from "../../config.js";
import { cookieOptions } from "../utils/cookieOptions.js";

import adminModel from "../models/adminModel.js";

//Array de funciones
const loginAdminController = {};

loginAdminController.login = async (req, res) => {
    try {
        //#1- Solicitar los datos
        let { email, password } = req.body;
        if (!password) password = req.body.contraseña;

        if (!email || !password) {
            return res.status(400).json({ message: "Fields required" });
        }

        email = email.trim();

        //Verificar si el correo existe en la base de datos (insensible a mayúsculas)
        const adminFound = await adminModel.findOne({
            email: { $regex: new RegExp(`^${email}$`, "i") }
        });

        //Si no existe el correo
        if (!adminFound) {
            return res.status(400).json({ message: "Admin not found" });
        }

        const storedPassword = adminFound.password || adminFound.contraseña;
        if (!storedPassword) {
            return res.status(401).json({ message: "Wrong password" });
        }

        //Validar la contraseña
        const isMatch = await bcrypt.compare(password, storedPassword);

        //Si la contraseña está incorrecta
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        //Generar el token
        const token = jsonwebtoken.sign(
            //#1- ¿que vamos a guardar?
            { id: adminFound._id, userType: "admin" },
            //#2- secret key
            config.JWT.secret,
            //#3- Cuando expira
            { expiresIn: "30d" },
        );

        //El token lo guardamos en una cokie
        res.cookie("authAdminCookie", token, cookieOptions(30 * 24 * 60 * 60 * 1000));

        return res.status(200).json({ message: "Login successfully" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export default loginAdminController;
