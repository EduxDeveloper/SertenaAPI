/*
    Proyectos/citas
*/

import { Schema, model } from "mongoose";

const proyectSchema = new Schema({
    idService: {
        type: Schema.Types.ObjectId,
        ref: "Service"
    },
    idCustomer: {
        type: Schema.Types.ObjectId,
        ref: "Cliente"
    },
    idEmpleado: {
        type: Schema.Types.ObjectId,
        ref: "Empleados"
    },
    dateStart: { type: Date },
    dateEnd: { type: Date },
    clientPhone: { type: String },
    clientDirection: { type: String },
    clientLocation: { type: String },
    finalPrice: { type: String },
    status: {
        type: String,
        enum: ["Programado", "Finalizado", "Atrasado"],
        default: "Programado"
    },
    isCompleted: { type: Boolean, default: false },
    completionNotes: { type: String, default: "" },
    completedAt: { type: Date, default: null },
    description: { type: String },
}, {
    timestamps: true,
    strict: false
})

export default model("Proyects", proyectSchema)
