import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createService,
  getServices,
  getService,
  getMyServices,
} from "./service.controller";

const router = Router();

router.get("/mine", authenticate, getMyServices);

/* Public routes */
router.get("/", getServices);
router.get("/:id", getService);

/* Protected route (must be logged in) */
router.post("/", authenticate, createService);

export default router;
