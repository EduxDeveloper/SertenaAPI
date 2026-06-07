import {Schema, model} from 'mongoose';

const reviewSchema = new Schema({
    idCustomer:{ type: Schema.Types.ObjectId, ref: 'Cliente' },
    idProyects:{ type: Schema.Types.ObjectId, ref: 'Proyects' },
    rating: { type: Number, required: true },
    comment: { type: String,},
}, {
    timestamps: true,
    strict: false
})

export default model("Review", reviewSchema)