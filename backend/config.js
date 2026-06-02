import dotenv from "dotenv";

//ejecutamos la libreria dotenv
dotenv.config();

export const config = {
    JWT: {
        secret: process.env.JWT_Secret_key,
    },
    email: {
        user_email: process.env.USER_EMAIL,
        user_password: process.env.USER_PASSWORD
    },
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
};

export default config;