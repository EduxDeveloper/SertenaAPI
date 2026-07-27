import { Schema, model } from "mongoose";

const empleadoSchema = new Schema({
    name: { type: String },
    lastName: { type: String },
    email: { type: String },
    password: { type: String },
    salary: { type: Number },
    // Solo los empleados con status: true pueden recibir citas automáticas.
    status: { type: Boolean, default: true },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service' }]
}, {
    timestamps: true,
    strict: false
});

export default model("Empleados", empleadoSchema);
