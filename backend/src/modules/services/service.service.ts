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