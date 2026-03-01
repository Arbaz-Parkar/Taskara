import prisma from "../../utils/prisma";

export const createService = async (
  userId: number,
  data: {
    title: string;
    description: string;
    category: string;
    price: number;
  }
) => {
  return prisma.service.create({
    data: {
      ...data,
      sellerId: userId,
    },
  });
};

export const getAllServices = async () => {
  return prisma.service.findMany({
    where: { isActive: true },
    include: {
      seller: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getServicesBySeller = async (userId: number) => {
  return prisma.service.findMany({
    where: {
      sellerId: userId,
    },
    include: {
      seller: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateServiceBySeller = async (
  userId: number,
  serviceId: number,
  data: {
    title?: string;
    description?: string;
    category?: string;
    price?: number;
  }
) => {
  const updated = await prisma.service.updateMany({
    where: {
      id: serviceId,
      sellerId: userId,
    },
    data,
  });

  if (updated.count === 0) {
    return null;
  }

  return prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      seller: {
        select: {
          name: true,
        },
      },
    },
  });
};

export const setServiceStatusBySeller = async (
  userId: number,
  serviceId: number,
  isActive: boolean
) => {
  const updated = await prisma.service.updateMany({
    where: {
      id: serviceId,
      sellerId: userId,
    },
    data: { isActive },
  });

  if (updated.count === 0) {
    return null;
  }

  return prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      seller: {
        select: {
          name: true,
        },
      },
    },
  });
};

export const deleteServiceBySeller = async (
  userId: number,
  serviceId: number
) => {
  const deleted = await prisma.service.deleteMany({
    where: {
      id: serviceId,
      sellerId: userId,
    },
  });

  return deleted.count > 0;
};

export const getServiceById = async (id: number) => {
  return prisma.service.findUnique({
    where: { id },
    include: {
      seller: {
        select: { name: true },
      },
    },
  });
};
