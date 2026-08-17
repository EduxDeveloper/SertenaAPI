import crypto from "crypto"; //Generar código aleatorio
import jsonwebtoken from "jsonwebtoken"; //Token
import bcryptjs from "bcryptjs"; //Encriptar contraseña

import clienteModel from "../models/ClientesModel.js";


import { config } from "../../config.js";
import { clearCookieOptions, cookieOptions } from "../utils/cookieOptions.js";
import htmlRecoveryEmail from "../utils/HTMLRecoveryEmail.js";
import { sendEmail } from "../utils/sendMailMailjet.js";


//array de funciones
const registerClientsController = {};

registerClientsController.register = async (req, res) => {
  try {
    //#1- Solicitar los datos a guardar
    const {
      nombre,
      email,
      contraseña,
      tipo,
      isVerified,
      loginAttempts,
      timeOut,
    } = req.body;

    //#2- Validar si el correo existe en la base de datos
    const existsCliente = await clienteModel.findOne({ email });
    if (existsCliente) {
      return res.status(400).json({ message: "Client already exists " });
    }

    if (!contraseña) {
      return res.status(400).json({ message: "Password is required" });
    }

    //Encriptar la contraseña
    const passwordHashed = await bcryptjs.hash(contraseña, 10);

    //Generar un código aleatorio
    const randomCode = crypto.randomBytes(3).toString("hex");

    //Guardamos todo en un token
    const token = jsonwebtoken.sign(
      //#1-¿Qué vamos a guardar?
      {
        randomCode,
        nombre,
        email,
        contraseña: passwordHashed,
        tipo,
        isVerified,
        loginAttempts,
        timeOut,
      },
      //#2- Secret key
      config.JWT.secret,
      //#3- ¿Cúando expira?
      { expiresIn: "15m" },
    );

    //guardamos el token en una cookie
    res.cookie("registrationCookie", token, cookieOptions(15 * 60 * 1000));

    const htmlContent = htmlRecoveryEmail(randomCode, {
      title: "Verificación de cuenta",
      message: "Hola, utiliza el siguiente código de verificación para completar la creación de tu cuenta:",
    });

    await sendEmail(email, "Verificación de cuenta", htmlContent);

    return res.status(200).json({ message: "Email sent" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server eror" });
  }
};

//VERIFICAR EL CÓDIGO QUE ACABAMOS DE ENVIAR
registerClientsController.verifyCode = async (req, res) => {
  try {
    //Solicitamos el código que el usuario escribió en el frontend
    const { verificationCodeRequest } = req.body;

    //Obtener el token de las cookies
    const token = req.cookies.registrationCookie;

    //Extraer todos los datos del token
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const {
      randomCode: storedCode,
        nombre,
        email,
        contraseña,
        tipo,
        isVerified,
        loginAttempts,
        timeOut,
    } = decoded;

    if (verificationCodeRequest !== storedCode) {
      return res.status(400).json({ message: "Invalid code" });
    }

    //Si todo está bien, y el usuario, lo registramos en la DB
    const newClient = clienteModel({
     nombre,
        email,
        contraseña,
        tipo: tipo || "persona",
        loginAttempts,
        timeOut,
      isVerified: true,
    });

    await newClient.save();

    res.clearCookie("registrationCookie", clearCookieOptions);

    return res.status(200).json({ message: "client registered" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default registerClientsController;
