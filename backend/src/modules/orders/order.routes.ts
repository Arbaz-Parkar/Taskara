import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import {
  changeOrderStatusAsAdmin,
  changeOrderStatus,
  createOrder,
  getAdminOrders,
  getMyBuyerOrders,
  getMessagesForOrder,
  getMySellerOrders,
  sendMessageForOrder,
  streamMessagesForOrder,
} from "./order.controller";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/buyer", authenticate, getMyBuyerOrders);
router.get("/seller", authenticate, getMySellerOrders);
router.patch("/:id/status", authenticate, changeOrderStatus);
router.get("/admin/list", authenticate, requireRole(["admin"]), getAdminOrders);
router.patch(
  "/admin/:id/status",
  authenticate,
  requireRole(["admin"]),
  changeOrderStatusAsAdmin
);
router.get("/:id/messages", authenticate, getMessagesForOrder);
router.get("/:id/messages/stream", authenticate, streamMessagesForOrder);
router.post("/:id/messages", authenticate, sendMessageForOrder);

export default router;
