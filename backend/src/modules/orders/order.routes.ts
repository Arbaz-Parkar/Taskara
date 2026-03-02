import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  changeOrderStatus,
  createOrder,
  getMyBuyerOrders,
  getMySellerOrders,
} from "./order.controller";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/buyer", authenticate, getMyBuyerOrders);
router.get("/seller", authenticate, getMySellerOrders);
router.patch("/:id/status", authenticate, changeOrderStatus);

export default router;
