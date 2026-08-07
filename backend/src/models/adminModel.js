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
    passwordChangeCodeHash: { type: String, default: null },
    passwordChangeCodeExpiresAt: { type: Date, default: null },
    passwordChangeCodeAttempts: { type: Number, default: 0 },
    passwordChangeVerifiedAt: { type: Date, default: null },
    passwordChangeLastSentAt: { type: Date, default: null },
    profileCurrentEmailCodeHash: { type: String, default: null },
    profileCurrentEmailCodeExpiresAt: { type: Date, default: null },
    profileCurrentEmailCodeAttempts: { type: Number, default: 0 },
    profileCurrentEmailVerifiedAt: { type: Date, default: null },
    profileCurrentEmailLastSentAt: { type: Date, default: null },
    pendingEmail: { type: String, default: null },
    pendingEmailCodeHash: { type: String, default: null },
    pendingEmailCodeExpiresAt: { type: Date, default: null },
    pendingEmailCodeAttempts: { type: Number, default: 0 },
    pendingEmailVerifiedAt: { type: Date, default: null },
    pendingEmailLastSentAt: { type: Date, default: null },
}, {
    timestamps: true,
    strict: false
})

export default model("Admin", adminSchema)

