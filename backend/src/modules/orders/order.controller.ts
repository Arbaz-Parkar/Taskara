import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as orderService from "./order.service";

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await orderService.createOrder(req.user!.userId, req.body);
    return res.status(201).json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    return res.status(400).json({ message });
  }
};

export const getMyBuyerOrders = async (req: AuthRequest, res: Response) => {
  const orders = await orderService.getBuyerOrders(req.user!.userId);
  return res.json(orders);
};

export const getMySellerOrders = async (req: AuthRequest, res: Response) => {
  const orders = await orderService.getSellerOrders(req.user!.userId);
  return res.json(orders);
};

export const changeOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body as { status?: orderService.OrderStatusValue };

    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const order = await orderService.updateOrderStatus(orderId, req.user!.userId, status);
    return res.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update order";

    if (message === "Order not found") {
      return res.status(404).json({ message });
    }

    return res.status(400).json({ message });
  }
};
