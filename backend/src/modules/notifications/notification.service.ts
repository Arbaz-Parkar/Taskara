import prisma from "../../utils/prisma";

export type NotificationType =
  | "ORDER_ACCEPTED"
  | "ORDER_DELIVERED"
  | "REVIEW_RECEIVED"
  | "REVIEW_REPLY_POSTED";

export const createNotification = async (payload: {
  recipientId: number;
  actorId?: number | null;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
}) => {
  return prisma.notification.create({
    data: {
      recipientId: payload.recipientId,
      actorId: payload.actorId ?? null,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      link: payload.link ?? null,
    },
  });
};

export const getMyNotifications = async (userId: number, limit = 40) => {
  const safeLimit = Math.max(1, Math.min(100, limit));
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: userId },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: safeLimit,
    }),
    prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    }),
  ]);

  return { items, unreadCount };
};

export const markNotificationRead = async (userId: number, notificationId: number) => {
  const updated = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      recipientId: userId,
    },
    data: {
      isRead: true,
    },
  });

  if (updated.count === 0) {
    throw new Error("Notification not found");
  }
};

export const markAllNotificationsRead = async (userId: number) => {
  await prisma.notification.updateMany({
    where: {
      recipientId: userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
};
