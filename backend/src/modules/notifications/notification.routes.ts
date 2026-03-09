import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notification.controller";

const router = Router();

router.get("/mine", authenticate, getMyNotifications);
router.patch("/mine/read-all", authenticate, markAllNotificationsRead);
router.patch("/:id/read", authenticate, markNotificationRead);

export default router;
