import { Schema, model } from "mongoose";

const clienteSchema = new Schema({
    nombre: { type: String},
    email: { type: String},
    contraseña: { type: String},
    tipo: { type: String},
    isVerified: { type: Boolean},
     loginAttempts: {type: Number},
    timeOut: {type: Date},
}, {
    timestamps: true,
    strict: false
});

export default model("Cliente", clienteSchema);
