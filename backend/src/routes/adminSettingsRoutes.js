import express from "express";
import adminSettingsController from "../controllers/adminSettingsController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

const router = express.Router();
const requireAdmin = validateAuthCookie("authAdminCookie", ["admin"]);

router.post("/request-password-code", requireAdmin, adminSettingsController.requestPasswordChangeCode);
router.post("/verify-password-code", requireAdmin, adminSettingsController.verifyPasswordChangeCode);
router.post("/change-password", requireAdmin, adminSettingsController.changePassword);
router.get("/profile", requireAdmin, adminSettingsController.getProfile);
router.post("/profile/request-current-email-code", requireAdmin, adminSettingsController.requestCurrentEmailCode);
router.post("/profile/verify-current-email-code", requireAdmin, adminSettingsController.verifyCurrentEmailCode);
router.post("/profile/request-new-email-code", requireAdmin, adminSettingsController.requestNewEmailCode);
router.post("/profile/verify-new-email-code", requireAdmin, adminSettingsController.verifyNewEmailCode);
router.put("/profile", requireAdmin, adminSettingsController.updateProfile);

export default router;
