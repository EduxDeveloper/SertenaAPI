import bcrypt from "bcryptjs";
import crypto from "crypto";
import adminModel from "../models/adminModel.js";
import htmlRecoveryEmail from "../utils/HTMLRecoveryEmail.js";
import { sendEmail } from "../utils/sendMailMailjet.js";

const CODE_EXPIRATION_MS = 15 * 60 * 1000;
const RESEND_WAIT_MS = 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;

const clearPasswordChangeCode = {
    passwordChangeCodeHash: null,
    passwordChangeCodeExpiresAt: null,
    passwordChangeCodeAttempts: 0,
    passwordChangeVerifiedAt: null,
    passwordChangeLastSentAt: null,
};

const isStrongPassword = (password) => (
    typeof password === "string"
    && password.length >= 8
    && /[a-zA-Z]/.test(password)
    && /\d/.test(password)
);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clearCurrentEmailCode = {
    profileCurrentEmailCodeHash: null,
    profileCurrentEmailCodeExpiresAt: null,
    profileCurrentEmailCodeAttempts: 0,
    profileCurrentEmailVerifiedAt: null,
    profileCurrentEmailLastSentAt: null,
};

const clearNewEmailCode = {
    pendingEmail: null,
    pendingEmailCodeHash: null,
    pendingEmailCodeExpiresAt: null,
    pendingEmailCodeAttempts: 0,
    pendingEmailVerifiedAt: null,
    pendingEmailLastSentAt: null,
};

const sendSixDigitCode = async ({ recipient, subject, code }) => {
    await sendEmail(
        recipient,
        subject,
        htmlRecoveryEmail(code, {
            title: subject,
            message: `Hola, utiliza el siguiente código de verificación. Vence en 15 minutos.`,
        }),
    );
};

const codeIsActive = (admin, hashField, expirationField) => (
    admin?.[hashField] && admin?.[expirationField] && admin[expirationField] >= new Date()
);

const adminSettingsController = {};

adminSettingsController.requestPasswordChangeCode = async (req, res) => {
    try {
        const admin = await adminModel.findById(req.adminId);
        if (!admin) return res.status(404).json({ message: "Administrador no encontrado." });

        const now = new Date();
        const lastSentAt = admin.passwordChangeLastSentAt?.getTime() || 0;
        const millisecondsUntilResend = RESEND_WAIT_MS - (now.getTime() - lastSentAt);
        if (millisecondsUntilResend > 0) {
            return res.status(429).json({ message: `Espera ${Math.ceil(millisecondsUntilResend / 1000)} segundos antes de solicitar otro código.` });
        }

        const code = crypto.randomInt(100000, 1000000).toString();
        const codeHash = await bcrypt.hash(code, 12);

        await sendSixDigitCode({
            recipient: admin.email,
            subject: "Código para cambiar la contraseña",
            code,
        });

        admin.passwordChangeCodeHash = codeHash;
        admin.passwordChangeCodeExpiresAt = new Date(now.getTime() + CODE_EXPIRATION_MS);
        admin.passwordChangeCodeAttempts = 0;
        admin.passwordChangeVerifiedAt = null;
        admin.passwordChangeLastSentAt = now;
        await admin.save();

        return res.json({ message: "Código enviado al correo registrado." });
    } catch (error) {
        console.error("Error al solicitar código de cambio de contraseña:", error);
        return res.status(500).json({ message: "No se pudo enviar el código. Intenta nuevamente." });
    }
};

adminSettingsController.verifyPasswordChangeCode = async (req, res) => {
    try {
        const code = String(req.body.code || "").trim();
        if (!/^\d{6}$/.test(code)) return res.status(400).json({ message: "El código debe tener 6 dígitos." });

        const admin = await adminModel.findById(req.adminId);
        if (!admin?.passwordChangeCodeHash || !admin.passwordChangeCodeExpiresAt || admin.passwordChangeCodeExpiresAt < new Date()) {
            if (admin) await admin.updateOne({ $set: clearPasswordChangeCode });
            return res.status(400).json({ message: "El código venció o no existe. Solicita uno nuevo." });
        }

        if (admin.passwordChangeCodeAttempts >= MAX_CODE_ATTEMPTS) {
            await admin.updateOne({ $set: clearPasswordChangeCode });
            return res.status(429).json({ message: "Se agotaron los intentos. Solicita un código nuevo." });
        }

        const isValid = await bcrypt.compare(code, admin.passwordChangeCodeHash);
        if (!isValid) {
            admin.passwordChangeCodeAttempts += 1;
            await admin.save();
            return res.status(400).json({ message: "Código incorrecto." });
        }

        admin.passwordChangeVerifiedAt = new Date();
        await admin.save();
        return res.json({ message: "Código verificado correctamente." });
    } catch (error) {
        console.error("Error al verificar código de cambio de contraseña:", error);
        return res.status(500).json({ message: "No se pudo verificar el código." });
    }
};

adminSettingsController.changePassword = async (req, res) => {
    try {
        const { newPassword, confirmNewPassword } = req.body;
        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres e incluir letras y números." });
        }
        if (newPassword !== confirmNewPassword) return res.status(400).json({ message: "Las contraseñas no coinciden." });

        const admin = await adminModel.findById(req.adminId);
        const isVerified = admin?.passwordChangeVerifiedAt
            && admin.passwordChangeCodeExpiresAt
            && admin.passwordChangeCodeExpiresAt >= new Date();
        if (!isVerified) return res.status(403).json({ message: "Debes verificar el código antes de cambiar la contraseña." });

        admin.password = await bcrypt.hash(newPassword, 12);
        Object.assign(admin, clearPasswordChangeCode);
        await admin.save();

        return res.json({ message: "Contraseña actualizada correctamente." });
    } catch (error) {
        console.error("Error al cambiar contraseña de administrador:", error);
        return res.status(500).json({ message: "No se pudo actualizar la contraseña." });
    }
};

adminSettingsController.getProfile = async (req, res) => {
    try {
        const admin = await adminModel.findById(req.adminId).select("name lastName email status timeOut createdAt");
        if (!admin) return res.status(404).json({ message: "Administrador no encontrado." });
        return res.json({
            data: {
                name: admin.name || "",
                lastName: admin.lastName || "",
                email: admin.email || "",
                status: admin.status === true,
                timeOut: admin.timeOut || null,
                createdAt: admin.createdAt,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: "No se pudo cargar el perfil." });
    }
};

adminSettingsController.requestCurrentEmailCode = async (req, res) => {
    try {
        const admin = await adminModel.findById(req.adminId);
        if (!admin) return res.status(404).json({ message: "Administrador no encontrado." });

        const now = new Date();
        const lastSentAt = admin.profileCurrentEmailLastSentAt?.getTime() || 0;
        const waitTime = RESEND_WAIT_MS - (now.getTime() - lastSentAt);
        if (waitTime > 0) return res.status(429).json({ message: `Espera ${Math.ceil(waitTime / 1000)} segundos antes de solicitar otro código.` });

        const code = crypto.randomInt(100000, 1000000).toString();
        await sendSixDigitCode({ recipient: admin.email, subject: "Confirma el cambio de correo", code });

        admin.profileCurrentEmailCodeHash = await bcrypt.hash(code, 12);
        admin.profileCurrentEmailCodeExpiresAt = new Date(now.getTime() + CODE_EXPIRATION_MS);
        admin.profileCurrentEmailCodeAttempts = 0;
        admin.profileCurrentEmailVerifiedAt = null;
        admin.profileCurrentEmailLastSentAt = now;
        Object.assign(admin, clearNewEmailCode);
        await admin.save();
        return res.json({ message: "Código enviado a tu correo actual." });
    } catch (error) {
        console.error("Error al enviar código al correo actual:", error);
        return res.status(500).json({ message: "No se pudo enviar el código al correo actual." });
    }
};

adminSettingsController.verifyCurrentEmailCode = async (req, res) => {
    try {
        const code = String(req.body.code || "").trim();
        if (!/^\d{6}$/.test(code)) return res.status(400).json({ message: "El código debe tener 6 dígitos." });
        const admin = await adminModel.findById(req.adminId);
        if (!codeIsActive(admin, "profileCurrentEmailCodeHash", "profileCurrentEmailCodeExpiresAt")) {
            if (admin) await admin.updateOne({ $set: clearCurrentEmailCode });
            return res.status(400).json({ message: "El código venció o no existe. Solicita uno nuevo." });
        }
        if (admin.profileCurrentEmailCodeAttempts >= MAX_CODE_ATTEMPTS) {
            await admin.updateOne({ $set: clearCurrentEmailCode });
            return res.status(429).json({ message: "Se agotaron los intentos. Solicita un código nuevo." });
        }
        if (!await bcrypt.compare(code, admin.profileCurrentEmailCodeHash)) {
            admin.profileCurrentEmailCodeAttempts += 1;
            await admin.save();
            return res.status(400).json({ message: "Código incorrecto." });
        }
        admin.profileCurrentEmailVerifiedAt = new Date();
        await admin.save();
        return res.json({ message: "Correo actual verificado. Ahora verifica el correo nuevo." });
    } catch (error) {
        return res.status(500).json({ message: "No se pudo verificar el código." });
    }
};

adminSettingsController.requestNewEmailCode = async (req, res) => {
    try {
        const newEmail = String(req.body.newEmail || "").trim().toLowerCase();
        if (!EMAIL_REGEX.test(newEmail)) return res.status(400).json({ message: "Ingresa un correo nuevo válido." });
        const admin = await adminModel.findById(req.adminId);
        if (!admin?.profileCurrentEmailVerifiedAt || !admin.profileCurrentEmailCodeExpiresAt || admin.profileCurrentEmailCodeExpiresAt < new Date()) {
            return res.status(403).json({ message: "Primero verifica el correo actual." });
        }
        if (newEmail === admin.email.toLowerCase()) return res.status(400).json({ message: "El correo nuevo debe ser diferente al actual." });
        if (await adminModel.exists({ email: newEmail, _id: { $ne: admin._id } })) return res.status(409).json({ message: "Ese correo ya está en uso." });

        const now = new Date();
        const lastSentAt = admin.pendingEmailLastSentAt?.getTime() || 0;
        const waitTime = RESEND_WAIT_MS - (now.getTime() - lastSentAt);
        if (admin.pendingEmail === newEmail && waitTime > 0) return res.status(429).json({ message: `Espera ${Math.ceil(waitTime / 1000)} segundos antes de solicitar otro código.` });

        const code = crypto.randomInt(100000, 1000000).toString();
        await sendSixDigitCode({ recipient: newEmail, subject: "Verifica tu nuevo correo", code });

        admin.pendingEmail = newEmail;
        admin.pendingEmailCodeHash = await bcrypt.hash(code, 12);
        admin.pendingEmailCodeExpiresAt = new Date(now.getTime() + CODE_EXPIRATION_MS);
        admin.pendingEmailCodeAttempts = 0;
        admin.pendingEmailVerifiedAt = null;
        admin.pendingEmailLastSentAt = now;
        await admin.save();
        return res.json({ message: "Código enviado al correo nuevo." });
    } catch (error) {
        console.error("Error al enviar código al correo nuevo:", error);
        return res.status(500).json({ message: "No se pudo enviar el código al correo nuevo." });
    }
};

adminSettingsController.verifyNewEmailCode = async (req, res) => {
    try {
        const code = String(req.body.code || "").trim();
        if (!/^\d{6}$/.test(code)) return res.status(400).json({ message: "El código debe tener 6 dígitos." });
        const admin = await adminModel.findById(req.adminId);
        if (!admin?.profileCurrentEmailVerifiedAt) return res.status(403).json({ message: "Primero verifica el correo actual." });
        if (!codeIsActive(admin, "pendingEmailCodeHash", "pendingEmailCodeExpiresAt")) {
            if (admin) await admin.updateOne({ $set: clearNewEmailCode });
            return res.status(400).json({ message: "El código venció o no existe. Solicita uno nuevo." });
        }
        if (admin.pendingEmailCodeAttempts >= MAX_CODE_ATTEMPTS) {
            await admin.updateOne({ $set: clearNewEmailCode });
            return res.status(429).json({ message: "Se agotaron los intentos. Solicita un código nuevo." });
        }
        if (!await bcrypt.compare(code, admin.pendingEmailCodeHash)) {
            admin.pendingEmailCodeAttempts += 1;
            await admin.save();
            return res.status(400).json({ message: "Código incorrecto." });
        }
        admin.pendingEmailVerifiedAt = new Date();
        await admin.save();
        return res.json({ message: "Correo nuevo verificado. Guarda los cambios para aplicarlo." });
    } catch (error) {
        return res.status(500).json({ message: "No se pudo verificar el código." });
    }
};

adminSettingsController.updateProfile = async (req, res) => {
    try {
        const name = String(req.body.name || "").trim();
        const lastName = String(req.body.lastName || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        if (name.length < 2 || lastName.length < 2 || !EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: "Nombre, apellido y correo válido son obligatorios." });
        }

        const admin = await adminModel.findById(req.adminId);
        if (!admin) return res.status(404).json({ message: "Administrador no encontrado." });
        const changingEmail = email !== admin.email.toLowerCase();
        if (changingEmail && (!admin.pendingEmailVerifiedAt || admin.pendingEmail !== email || !admin.pendingEmailCodeExpiresAt || admin.pendingEmailCodeExpiresAt < new Date())) {
            return res.status(403).json({ message: "Debes completar las dos verificaciones de correo antes de guardarlo." });
        }
        if (changingEmail && await adminModel.exists({ email, _id: { $ne: admin._id } })) return res.status(409).json({ message: "Ese correo ya está en uso." });

        admin.name = name;
        admin.lastName = lastName;
        if (changingEmail) {
            admin.email = email;
            Object.assign(admin, clearCurrentEmailCode, clearNewEmailCode);
        }
        await admin.save();
        return res.json({ message: "Perfil actualizado correctamente.", data: { name: admin.name, lastName: admin.lastName, email: admin.email, status: admin.status === true, timeOut: admin.timeOut || null } });
    } catch (error) {
        return res.status(500).json({ message: "No se pudo actualizar el perfil." });
    }
};

export default adminSettingsController;
