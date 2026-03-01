import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createService,
  getServices,
  getService,
  getMyServices,
  updateMyService,
  updateMyServiceStatus,
  deleteMyService,
} from "./service.controller";

const router = Router();

router.get("/mine", authenticate, getMyServices);
router.put("/:id", authenticate, updateMyService);
router.patch("/:id/status", authenticate, updateMyServiceStatus);
router.delete("/:id", authenticate, deleteMyService);

/* Public routes */
router.get("/", getServices);
router.get("/:id", getService);

/* Protected route (must be logged in) */
router.post("/", authenticate, createService);

export default router;
