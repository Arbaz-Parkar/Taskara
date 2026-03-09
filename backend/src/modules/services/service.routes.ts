import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  deleteAdminService,
  createService,
  getAdminServices,
  getMarketplaceStats,
  getServices,
  getService,
  getMyServices,
  updateAdminServiceStatus,
  updateMyService,
  updateMyServiceStatus,
  deleteMyService,
} from "./service.controller";

const router = Router();

router.get("/mine", authenticate, getMyServices);
router.put("/:id", authenticate, updateMyService);
router.patch("/:id/status", authenticate, updateMyServiceStatus);
router.delete("/:id", authenticate, deleteMyService);
router.get("/admin/list", authenticate, requireRole(["admin"]), getAdminServices);
router.patch(
  "/admin/:id/status",
  authenticate,
  requireRole(["admin"]),
  updateAdminServiceStatus
);
router.delete(
  "/admin/:id",
  authenticate,
  requireRole(["admin"]),
  deleteAdminService
);

/* Public routes */
router.get("/", getServices);
router.get("/market-stats", getMarketplaceStats);
router.get("/:id", getService);

/* Protected route (must be logged in) */
router.post("/", authenticate, createService);

export default router;
