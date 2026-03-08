import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  createDispute,
  getAdminDisputes,
  getDisputeById,
  getDisputeMessages,
  getEligibleOrdersForDispute,
  getMyDisputes,
  sendDisputeMessage,
  updateDisputeStatusAsAdmin,
} from "./dispute.controller";

const router = Router();

router.get("/mine/orders-eligible", authenticate, getEligibleOrdersForDispute);
router.get("/mine", authenticate, getMyDisputes);
router.get("/admin/list", authenticate, requireRole(["admin"]), getAdminDisputes);
router.post("/", authenticate, createDispute);
router.get("/:id", authenticate, getDisputeById);
router.get("/:id/messages", authenticate, getDisputeMessages);
router.post("/:id/messages", authenticate, sendDisputeMessage);
router.patch(
  "/admin/:id/status",
  authenticate,
  requireRole(["admin"]),
  updateDisputeStatusAsAdmin
);

export default router;
