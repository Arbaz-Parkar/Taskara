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

export const getMessagesForOrder = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const messages = await orderService.getOrderMessages(orderId, req.user!.userId);
    return res.json(messages);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load messages";

    if (message === "Order not found") {
      return res.status(404).json({ message });
    }

    return res.status(400).json({ message });
  }
};

export const sendMessageForOrder = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { content, attachments } = req.body as {
      content?: string;
      attachments?: { fileName: string; mimeType?: string; dataBase64: string }[];
    };

    const hasText = Boolean(content && content.trim());
    const hasAttachments = Boolean(attachments && attachments.length > 0);

    if (!hasText && !hasAttachments) {
      return res.status(400).json({ message: "content or attachments are required" });
    }

    const message = await orderService.createOrderMessage(
      orderId,
      req.user!.userId,
      content?.trim() ?? "",
      attachments ?? []
    );
    return res.status(201).json(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message";

    if (message === "Order not found") {
      return res.status(404).json({ message });
    }

    if (message === "You are not allowed to access this order") {
      return res.status(403).json({ message });
    }

    return res.status(403).json({ message });
  }
};

export const getAdminOrders = async (_req: AuthRequest, res: Response) => {
  try {
    const orders = await orderService.getAdminOrders();
    return res.json(orders);
  } catch {
    return res.status(500).json({ message: "Failed to load orders" });
  }
};

export const changeOrderStatusAsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body as { status?: orderService.OrderStatusValue };

    if (Number.isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const order = await orderService.updateOrderStatusByAdmin(orderId, status);
    return res.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update order";

    if (message === "Order not found") {
      return res.status(404).json({ message });
    }

    return res.status(400).json({ message });
  }
};
