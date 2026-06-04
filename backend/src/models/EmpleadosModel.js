import { Schema, model } from "mongoose";

const empleadoSchema = new Schema({
    name: {type: String},
    lastName: {type: String},
    email: {type: String},
    password: { type: String},
    salary: { type: Number},
    status: { type: String}
}, {
    timestamps: true
});

export default model("Empleados", empleadoSchema);
