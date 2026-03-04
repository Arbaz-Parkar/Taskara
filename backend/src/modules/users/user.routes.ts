import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  getMySettings,
  getPublicUserProfile,
  getPublicUserReviews,
  getPublicUserServices,
  updateMyPassword,
  updateMyPreferences,
  updateMyProfile,
  updateMyProviderProfile,
} from "./user.controller";

const router = Router();

router.get("/me/settings", authenticate, getMySettings);
router.patch("/me/profile", authenticate, updateMyProfile);
router.patch("/me/preferences", authenticate, updateMyPreferences);
router.patch("/me/provider-profile", authenticate, updateMyProviderProfile);
router.patch("/me/security/password", authenticate, updateMyPassword);

router.get("/:id", getPublicUserProfile);
router.get("/:id/services", getPublicUserServices);
router.get("/:id/reviews", getPublicUserReviews);

export default router;
