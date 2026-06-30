import nodemailer from "nodemailer"; //Enviar correos
import crypto from "crypto"; //Generar código aleatorio
import jsonwebtoken from "jsonwebtoken"; //Token
import bcryptjs from "bcryptjs"; //Encriptar contraseña

import clienteModel from "../models/clientesModel.js";

import { config } from "../../config.js";
import { register } from "module";

//array de funciones
const registerCustomerController = {};

registerCustomerController.register = async (req, res) => {
  try {
    //#1- Solicitar los datos a guardar
    const {
      nombre,
      email,
      password,
      tipo,
      isVerified,
      loginAttempts,
      timeOut,
    } = req.body;

    //#2- Validar si el correo existe en la base de datos
    const existsCliente = await clienteModel.findOne({ email });
    if (existsCliente) {
      return res.status(400).json({ message: "Customer already exists " });
    }

    //Encriptar la contraseña
    const passwordHashed = await bcryptjs.hash(password, 10);

    //Generar un código aleatorio
    const randomCode = crypto.randomBytes(3).toString("hex");

    //Guardamos todo en un token
    const token = jsonwebtoken.sign(
      //#1-¿Qué vamos a guardar?
      {
        randomCode,
        nombre,
        email,
        password: passwordHashed,
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
    res.cookie("registrationCookie", token, { maxAge: 15 * 60 * 1000 });

    //ENVIAR CORREO ELECTÓNICO
    //#1- Transporter -> ¿Quién lo envía?
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.user_email,
        pass: config.email.user_password,
      },
    });

    //#2- mailOptions -> ¿Quíen lo recibe y cómo?
    const mailOptions = {
      from: config.email.user_email,
      to: email,
      subject: "Verificación de cuenta",
      text:
        "Para verificar tu cuenta, utiliza este código " +
        randomCode +
        " expira en 15 minutos",
    };

    //#3- Enviar el correo electrónico
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("error"+error);
        return res.status(500).json({ message: "Error sending email" });
      }

      return res.status(200).json({ message: "Email sent" });
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server eror" });
  }
};

//VERIFICAR EL CÓDIGO QUE ACABAMOS DE ENVIAR
registerCustomerController.verifyCode = async (req, res) => {
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
        password,
        isVerified,
        loginAttempts,
        timeOut,
    } = decoded;

    if (verificationCodeRequest !== storedCode) {
      return res.status(400).json({ message: "Invalid code" });
    }

    //Si todo está bien, y el usuario, lo registramos en la DB
    const newClient = customerModel({
     nombre,
        email,
        password,
        loginAttempts,
        timeOut,
      isVerified: true,
    });

    await newClient.save();

    res.clearCookie("registrationCookie");

    return res.status(200).json({ message: "Customer registered" });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default registerClientController;
