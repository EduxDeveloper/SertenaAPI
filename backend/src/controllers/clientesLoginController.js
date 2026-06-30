import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

import { config } from "../../config.js";

import ClientesModel from "../models/clientesModel.js";

//Array de funciones
const clientesLoginController = {};

clientesLoginController.login = async (req, res) => {
    try {
        //#1- Solicitar los datos
        const { email, contraseña } = req.body;

        //Verificar si el correo existe en la base de datos
        const clienteFound = await ClientesModel.findOne({ email });

        //Si no existe el correo
        if (!clienteFound) {
            return res.status(400).json({ message: "Employee not found" });
        }

        //Validar la contraseña
        const isMatch = await bcrypt.compare(contraseña, clienteFound.contraseña);


        //Generar el token
        const token = jsonwebtoken.sign(
            //#1- ¿que vamos a guardar?
            { id: clienteFound._id, userType: "client" },
            //#2- secret key
            config.JWT.secret,
            //#3- Cuando expira
            { expiresIn: "30d" },
        );

        //El token lo guardamos en una cokie
        res.cookie("authClienteCookie", token, { maxAge: 30 * 24 * 60 * 60 * 1000 });

        return res.status(200).json({ message: "Login successfully" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export default empleadosLoginController;