import mongoose from "mongoose";
import { config } from "../backend/config.js";

export const databaseConnection = mongoose.connect(config.db.uri);

const connection = mongoose.connection;

connection.once("open", () => {
    console.log("DB is connected");
});

connection.on("disconnected", () => {
    console.log("DB is disconnected");
});

connection.on("error", (error) => {
    console.log("Error found" + error);
});
