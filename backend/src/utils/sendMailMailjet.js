import Mailjet from "node-mailjet";
import { config } from "../../config.js";

const mailjet = Mailjet.apiConnect(
    config.mailjet.apiKey,
    config.mailjet.secretKey,
);

/*
 * SMTP de Gmail se conserva como alternativa local, pero queda deshabilitado
 * en Render porque Render bloquea los puertos SMTP salientes. Mailjet envía
 * los correos mediante su API HTTP, por lo que no depende de esos puertos.
 *
 * import nodemailer from "nodemailer";
 * const transporter = nodemailer.createTransport({
 *   service: "gmail",
 *   auth: {
 *     user: config.email.user_email,
 *     pass: config.email.user_password,
 *   },
 * });
 */

/**
 * Envía un correo HTML con Mailjet.
 * @param {string} to Dirección de correo del destinatario.
 * @param {string} subject Asunto del correo.
 * @param {string} html Contenido HTML que recibirá el usuario.
 */
export const sendEmail = async (to, subject, html) => {
    try {
        const result = await mailjet
            .post("send", { version: "v3.1" })
            .request({
                Messages: [
                    {
                        From: {
                            Email: config.mailjet.fromEmail,
                            Name: config.mailjet.fromName,
                        },
                        To: [{ Email: to }],
                        Subject: subject,
                        HTMLPart: html,
                    },
                ],
            });

        console.log(`Correo enviado a ${to}`);
        return result.body;
    } catch (error) {
        console.error("Error enviando correo con Mailjet:", error.response?.body || error.message);
        throw new Error("No se pudo enviar el correo");
    }
};
