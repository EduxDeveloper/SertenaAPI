import dotenv from "dotenv";

//ejecutamos la libreria dotenv
dotenv.config();

export const config = {
    JWT: {
        secret: process.env.JWT_Secret_key,
    },
    // SMTP de Gmail se conserva como referencia, pero no se usa en Render
    // porque Render bloquea los puertos SMTP salientes.
    email: {
        user_email: process.env.USER_EMAIL,
        user_password: process.env.USER_PASSWORD
    },
    mailjet: {
        apiKey: process.env.API_KEY_MAILJET,
        secretKey: process.env.API_SECRET_MAILJET,
        fromEmail: process.env.MAILJET_FROM_EMAIL,
        fromName: process.env.MAILJET_FROM_NAME,
    },
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    },
    db:{
        uri: process.env.DB_URI
    }
};

export default config;
