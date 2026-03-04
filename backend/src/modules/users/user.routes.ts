import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  deactivateMyAccount,
  deleteMyAccount,
  exportMyAccountData,
  getMySettings,
  getPublicUserProfile,
  getPublicUserReviews,
  getPublicUserServices,
  updateMyAvatar,
  updateMyPassword,
  updateMyPreferences,
  updateMyProfile,
  updateMyProviderProfile,
} from "./user.controller";

const router = Router();

router.get("/me/settings", authenticate, getMySettings);
router.get("/me/export", authenticate, exportMyAccountData);
router.patch("/me/avatar", authenticate, updateMyAvatar);
router.patch("/me/profile", authenticate, updateMyProfile);
router.patch("/me/preferences", authenticate, updateMyPreferences);
router.patch("/me/provider-profile", authenticate, updateMyProviderProfile);
router.patch("/me/security/password", authenticate, updateMyPassword);
router.patch("/me/deactivate", authenticate, deactivateMyAccount);
router.delete("/me", authenticate, deleteMyAccount);

router.get("/:id", getPublicUserProfile);
router.get("/:id/services", getPublicUserServices);
router.get("/:id/reviews", getPublicUserReviews);

export default router;
