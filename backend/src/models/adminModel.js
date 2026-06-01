/* 
    name
    lastName
    email
    password
    estado/status
*/

import { Schema, model } from "mongoose";


const adminSchema = new Schema({
    name: { type: String },
    lastName: { type: String },
    email: { type: String },
    password: { type: String },
    status: { type: Boolean },
    timeOut: { type: Date },
}, {
    timestamps: true,
    strict: false
})

export default model("Admin", adminSchema)

