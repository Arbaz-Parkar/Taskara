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
          id: true,
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
          id: true,
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
          id: true,
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
          id: true,
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
        select: { id: true, name: true },
      },
    },
  });
};

export const getAdminServices = async () => {
  return prisma.service.findMany({
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const setServiceStatusByAdmin = async (
  serviceId: number,
  isActive: boolean
) => {
  const updated = await prisma.service.updateMany({
    where: {
      id: serviceId,
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
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });
};

export const deleteServiceByAdmin = async (serviceId: number) => {
  const deleted = await prisma.service.deleteMany({
    where: {
      id: serviceId,
    },
  });

  return deleted.count > 0;
};
