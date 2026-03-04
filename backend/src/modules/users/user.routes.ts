import { Router } from "express";
import { getPublicUserProfile, getPublicUserServices } from "./user.controller";

const router = Router();

router.get("/:id", getPublicUserProfile);
router.get("/:id/services", getPublicUserServices);

export default router;
