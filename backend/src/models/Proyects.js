/*
    Proyectos/citas
*/

import {Schema, model} from mongoose

const proyectSchema = new Schema({
    idService:{
        type: mongoose.Schema.type.ObjectId,
        ref: "Services"
    },
    idCustomer:{
        type: mongoose.Schema.type.ObjectId,
        ref: "Customer"
    },
    dateStart:{type:Date},
    dateEnd:{type:Date},
    clientPhone:{type:String},
    clientDirection:{type:String},
    clientLocation:{type:String},
    finalPrice:{type:String},
    status:{type:String},
    descritption:{type:String},
},{
    timestamps: true,
    strict: false
})

export default model("Proyects", proyectSchema)