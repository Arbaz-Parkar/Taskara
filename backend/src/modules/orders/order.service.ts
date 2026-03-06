import prisma from "../../utils/prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export type OrderStatusValue =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

const orderInclude = {
  service: {
    select: {
      id: true,
      title: true,
      category: true,
    },
  },
  buyer: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
  seller: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
  review: {
    select: {
      id: true,
      rating: true,
      comment: true,
      reviewerId: true,
      revieweeId: true,
      createdAt: true,
    },
  },
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_ATTACHMENTS_PER_MESSAGE = 5;
const uploadsRoot = path.resolve(process.cwd(), "uploads", "order-messages");

type MessageAttachmentInput = {
  fileName: string;
  mimeType?: string;
  dataBase64: string;
};

const sanitizeFileName = (fileName: string) =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

const buildAttachmentUrl = (filePath: string) => {
  const relativePath = path
    .relative(path.resolve(process.cwd(), "uploads"), filePath)
    .split(path.sep)
    .join("/");

  return `/uploads/${relativePath}`;
};

export const createOrder = async (
  buyerId: number,
  data: {
    serviceId: number;
    requirements?: string;
  }
) => {
  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
  });

  if (!service || !service.isActive) {
    throw new Error("Service is not available");
  }

  if (service.sellerId === buyerId) {
    throw new Error("You cannot place an order on your own service");
  }

  return prisma.order.create({
    data: {
      serviceId: service.id,
      buyerId,
      sellerId: service.sellerId,
      amount: service.price,
      requirements: data.requirements,
      status: "PENDING",
    },
    include: orderInclude,
  });
};

export const getBuyerOrders = async (buyerId: number) => {
  return prisma.order.findMany({
    where: { buyerId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getSellerOrders = async (sellerId: number) => {
  return prisma.order.findMany({
    where: { sellerId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
};

const sellerTransitions: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  COMPLETED: [],
  CANCELLED: [],
};

const buyerTransitions: Record<OrderStatusValue, OrderStatusValue[]> = {
  PENDING: ["CANCELLED"],
  ACCEPTED: ["CANCELLED"],
  IN_PROGRESS: ["CANCELLED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const updateOrderStatus = async (
  orderId: number,
  userId: number,
  nextStatus: OrderStatusValue
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const currentStatus = order.status as OrderStatusValue;

  if (order.sellerId === userId) {
    if (!sellerTransitions[currentStatus].includes(nextStatus)) {
      throw new Error("Invalid seller status transition");
    }
  } else if (order.buyerId === userId) {
    if (!buyerTransitions[currentStatus].includes(nextStatus)) {
      throw new Error("Invalid buyer status transition");
    }
  } else {
    throw new Error("You are not allowed to update this order");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: nextStatus,
    },
    include: orderInclude,
  });
};

const getOrderForUser = async (orderId: number, userId: number) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.buyerId !== userId && order.sellerId !== userId) {
    throw new Error("You are not allowed to access this order");
  }

  return order;
};

export const getOrderMessages = async (orderId: number, userId: number) => {
  await getOrderForUser(orderId, userId);

  return prisma.orderMessage.findMany({
    where: { orderId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      attachments: {
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          mimeType: true,
          size: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const createOrderMessage = async (
  orderId: number,
  userId: number,
  content: string,
  attachments: MessageAttachmentInput[] = []
) => {
  await getOrderForUser(orderId, userId);

  if (attachments.length > MAX_ATTACHMENTS_PER_MESSAGE) {
    throw new Error(`You can upload up to ${MAX_ATTACHMENTS_PER_MESSAGE} files per message`);
  }

  const message = await prisma.orderMessage.create({
    data: {
      orderId,
      senderId: userId,
      content,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (attachments.length === 0) {
    return { ...message, attachments: [] };
  }

  const messageDir = path.join(uploadsRoot, String(orderId), String(message.id));
  await fs.mkdir(messageDir, { recursive: true });

  const attachmentRows = await Promise.all(
    attachments.map(async (attachment) => {
      const decoded = Buffer.from(attachment.dataBase64, "base64");

      if (!decoded.length) {
        throw new Error("Attachment payload is empty");
      }

      if (decoded.length > MAX_ATTACHMENT_BYTES) {
        throw new Error("One or more attachments exceed 10 MB");
      }

      const safeName = sanitizeFileName(attachment.fileName || "attachment");
      const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const outputPath = path.join(messageDir, uniqueName);
      await fs.writeFile(outputPath, decoded);

      return {
        messageId: message.id,
        fileName: attachment.fileName,
        fileUrl: buildAttachmentUrl(outputPath),
        mimeType: attachment.mimeType || "application/octet-stream",
        size: decoded.length,
      };
    })
  );

  await prisma.orderMessageAttachment.createMany({
    data: attachmentRows,
  });

  const savedMessage = await prisma.orderMessage.findUnique({
    where: { id: message.id },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
        },
      },
      attachments: {
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          mimeType: true,
          size: true,
        },
      },
    },
  });

  if (!savedMessage) {
    throw new Error("Failed to create message");
  }

  return savedMessage;
};

export const getAdminOrders = async () => {
  return prisma.order.findMany({
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
};

const validStatuses: OrderStatusValue[] = [
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

export const updateOrderStatusByAdmin = async (
  orderId: number,
  nextStatus: OrderStatusValue
) => {
  if (!validStatuses.includes(nextStatus)) {
    throw new Error("Invalid status");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: nextStatus,
    },
    include: orderInclude,
  });
};
