import { Router } from "express";
import {
  getPublicUserProfile,
  getPublicUserReviews,
  getPublicUserServices,
} from "./user.controller";

const router = Router();

router.get("/:id", getPublicUserProfile);
router.get("/:id/services", getPublicUserServices);
router.get("/:id/reviews", getPublicUserReviews);

export default router;
