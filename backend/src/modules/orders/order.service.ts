import prisma from "../../utils/prisma";

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
    },
  },
  seller: {
    select: {
      id: true,
      name: true,
    },
  },
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
  content: string
) => {
  await getOrderForUser(orderId, userId);

  return prisma.orderMessage.create({
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
        },
      },
    },
  });
};
