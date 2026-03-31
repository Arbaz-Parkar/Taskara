import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import prisma from "../../utils/prisma";
import { publishDisputeMessage } from "./dispute.realtime";

export type DisputeStatusValue = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";

type DisputeAttachmentInput = {
  fileName: string;
  mimeType?: string;
  dataBase64: string;
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_ATTACHMENTS_PER_MESSAGE = 5;
const uploadsRoot = path.resolve(process.cwd(), "uploads", "dispute-messages");

const sanitizeFileName = (fileName: string) =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

const buildAttachmentUrl = (filePath: string) => {
  const relativePath = path
    .relative(path.resolve(process.cwd(), "uploads"), filePath)
    .split(path.sep)
    .join("/");

  return `/uploads/${relativePath}`;
};

export const getDisputeForActor = async (
  disputeId: number,
  userId: number,
  role: string
) => {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      order: {
        select: {
          id: true,
          status: true,
          amount: true,
          service: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          email: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          email: true,
        },
      },
      raisedBy: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          email: true,
        },
      },
    },
  });

  if (!dispute) {
    throw new Error("Dispute not found");
  }

  const isAdmin = role === "admin";
  const isParty = dispute.buyerId === userId || dispute.sellerId === userId;

  if (!isAdmin && !isParty) {
    throw new Error("You are not allowed to access this dispute");
  }

  return dispute;
};

const buildTimeline = (
  dispute: {
    status: DisputeStatusValue;
    createdAt: Date;
    updatedAt: Date;
    raisedBy: { id: number; name: string };
  },
  messages: { id: number; senderId: number; createdAt: Date; sender: { name: string } }[]
) => {
  const timeline = [
    {
      key: `open-${dispute.createdAt.toISOString()}`,
      type: "DISPUTE_OPENED",
      status: "OPEN",
      at: dispute.createdAt,
      actor: {
        id: dispute.raisedBy.id,
        name: dispute.raisedBy.name,
      },
      label: "Dispute opened",
    },
  ];

  if (dispute.status !== "OPEN") {
    timeline.push({
      key: `status-${dispute.updatedAt.toISOString()}`,
      type: "STATUS_UPDATED",
      status: dispute.status,
      at: dispute.updatedAt,
      actor: {
        id: 0,
        name: "Admin",
      },
      label: `Status changed to ${dispute.status.replace(/_/g, " ")}`,
    });
  }

  messages.forEach((message) => {
    timeline.push({
      key: `message-${message.id}`,
      type: "MESSAGE_POSTED",
      status: dispute.status,
      at: message.createdAt,
      actor: {
        id: message.senderId,
        name: message.sender.name,
      },
      label: "New message posted",
    });
  });

  return timeline.sort((a, b) => a.at.getTime() - b.at.getTime());
};

const persistDisputeAttachments = async (
  disputeId: number,
  messageId: number,
  attachments: DisputeAttachmentInput[]
) => {
  if (!attachments.length) {
    return [];
  }

  if (attachments.length > MAX_ATTACHMENTS_PER_MESSAGE) {
    throw new Error(`You can upload up to ${MAX_ATTACHMENTS_PER_MESSAGE} files per message`);
  }

  const messageDir = path.join(uploadsRoot, String(disputeId), String(messageId));
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
        messageId,
        fileName: attachment.fileName,
        fileUrl: buildAttachmentUrl(outputPath),
        mimeType: attachment.mimeType || "application/octet-stream",
        size: decoded.length,
      };
    })
  );

  await prisma.disputeMessageAttachment.createMany({
    data: attachmentRows,
  });

  return attachmentRows;
};

export const getEligibleOrdersForDispute = async (userId: number) => {
  return prisma.order.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
      status: {
        in: ["DELIVERED", "COMPLETED"],
      },
    },
    include: {
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
      dispute: {
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export const getMyDisputes = async (userId: number) => {
  return prisma.dispute.findMany({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    },
    include: {
      order: {
        select: {
          id: true,
          status: true,
          amount: true,
          service: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
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
      raisedBy: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export const getAdminDisputes = async () => {
  return prisma.dispute.findMany({
    include: {
      order: {
        select: {
          id: true,
          status: true,
          amount: true,
          service: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          email: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          email: true,
        },
      },
      raisedBy: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          email: true,
        },
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export const createDispute = async (
  userId: number,
  payload: {
    orderId: number;
    reason: string;
    message?: string;
    attachments?: DisputeAttachmentInput[];
  }
) => {
  const order = await prisma.order.findUnique({
    where: { id: payload.orderId },
    include: {
      dispute: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.buyerId !== userId && order.sellerId !== userId) {
    throw new Error("You are not allowed to dispute this order");
  }

  if (order.status !== "DELIVERED" && order.status !== "COMPLETED") {
    throw new Error("Only delivered or completed orders can be disputed");
  }

  if (order.dispute) {
    throw new Error("A dispute already exists for this order");
  }

  const dispute = await prisma.dispute.create({
    data: {
      orderId: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      raisedById: userId,
      reason: payload.reason.trim(),
      status: "OPEN",
    },
  });

  const messageText = payload.message?.trim();
  const hasText = Boolean(messageText);
  const hasAttachments = Boolean(payload.attachments && payload.attachments.length > 0);

  if (hasText || hasAttachments) {
    const message = await prisma.disputeMessage.create({
      data: {
        disputeId: dispute.id,
        senderId: userId,
        content: messageText || "Evidence attached for this dispute.",
      },
    });

    if (payload.attachments?.length) {
      await persistDisputeAttachments(dispute.id, message.id, payload.attachments);
    }
  }

  return getDisputeById(dispute.id, userId, "user");
};

export const getDisputeMessages = async (
  disputeId: number,
  userId: number,
  role: string
) => {
  await getDisputeForActor(disputeId, userId, role);

  return prisma.disputeMessage.findMany({
    where: { disputeId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: {
            select: {
              name: true,
            },
          },
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

export const createDisputeMessage = async (
  disputeId: number,
  userId: number,
  role: string,
  content: string,
  attachments: DisputeAttachmentInput[] = []
) => {
  const dispute = await getDisputeForActor(disputeId, userId, role);

  const message = await prisma.disputeMessage.create({
    data: {
      disputeId: dispute.id,
      senderId: userId,
      content: content.trim(),
    },
  });

  if (attachments.length) {
    await persistDisputeAttachments(dispute.id, message.id, attachments);
  }

  const savedMessage = await prisma.disputeMessage.findUnique({
    where: { id: message.id },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: {
            select: {
              name: true,
            },
          },
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

  publishDisputeMessage(dispute.id, savedMessage);

  return savedMessage;
};

export const getDisputeById = async (
  disputeId: number,
  userId: number,
  role: string
) => {
  const dispute = await getDisputeForActor(disputeId, userId, role);
  const messages = await getDisputeMessages(disputeId, userId, role);

  return {
    ...dispute,
    messages,
    timeline: buildTimeline(
      {
        status: dispute.status as DisputeStatusValue,
        createdAt: dispute.createdAt,
        updatedAt: dispute.updatedAt,
        raisedBy: {
          id: dispute.raisedBy.id,
          name: dispute.raisedBy.name,
        },
      },
      messages.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        createdAt: message.createdAt,
        sender: { name: message.sender.name },
      }))
    ),
  };
};

const validStatuses: DisputeStatusValue[] = ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"];

export const updateDisputeStatusByAdmin = async (
  disputeId: number,
  status: DisputeStatusValue
) => {
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid dispute status");
  }

  const dispute = await prisma.dispute.findUnique({
    where: {
      id: disputeId,
    },
  });

  if (!dispute) {
    throw new Error("Dispute not found");
  }

  return prisma.dispute.update({
    where: { id: disputeId },
    data: { status },
    include: {
      order: {
        select: {
          id: true,
          status: true,
          amount: true,
          service: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
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
      raisedBy: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
};
