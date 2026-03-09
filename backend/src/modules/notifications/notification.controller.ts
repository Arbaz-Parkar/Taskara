import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as notificationService from "./notification.service";

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const limit = Number(req.query.limit ?? 40);
    const data = await notificationService.getMyNotifications(req.user!.userId, limit);
    return res.json(data);
  } catch {
    return res.status(500).json({ message: "Failed to load notifications" });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const notificationId = Number(req.params.id);
    if (Number.isNaN(notificationId)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    await notificationService.markNotificationRead(req.user!.userId, notificationId);
    return res.json({ message: "Notification marked as read" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark notification";
    if (message === "Notification not found") {
      return res.status(404).json({ message });
    }
    return res.status(400).json({ message });
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markAllNotificationsRead(req.user!.userId);
    return res.json({ message: "All notifications marked as read" });
  } catch {
    return res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};
