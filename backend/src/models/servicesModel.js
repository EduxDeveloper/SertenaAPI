/*
    nameService
    imgUrl
    description
    price
*/

import { Schema, model } from "mongoose";

const serviceSchema = new Schema({
    nameService: { type: String },
    imgUrl: { type: String },
    public_id: { type: String },
    description: { type: String },
    price: { type: Number }
}, {
    timestamps: true,
    strict: false
})

export default model("Service", serviceSchema)
