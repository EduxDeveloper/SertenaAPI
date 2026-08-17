import express from "express";
import adminSettingsController from "../controllers/adminSettingsController.js";
import { verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/request-password-code", verifyAdminToken, adminSettingsController.requestPasswordChangeCode);
router.post("/verify-password-code", verifyAdminToken, adminSettingsController.verifyPasswordChangeCode);
router.post("/change-password", verifyAdminToken, adminSettingsController.changePassword);
router.get("/profile", verifyAdminToken, adminSettingsController.getProfile);
router.post("/profile/request-current-email-code", verifyAdminToken, adminSettingsController.requestCurrentEmailCode);
router.post("/profile/verify-current-email-code", verifyAdminToken, adminSettingsController.verifyCurrentEmailCode);
router.post("/profile/request-new-email-code", verifyAdminToken, adminSettingsController.requestNewEmailCode);
router.post("/profile/verify-new-email-code", verifyAdminToken, adminSettingsController.verifyNewEmailCode);
router.put("/profile", verifyAdminToken, adminSettingsController.updateProfile);

export default router;
