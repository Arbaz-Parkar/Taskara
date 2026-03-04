import prisma from "../../utils/prisma";

export const getPublicUserById = async (userId: number) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      providerProfile: {
        select: {
          bio: true,
          experienceYears: true,
          baseHourlyRate: true,
          serviceRadiusKm: true,
          averageRating: true,
          totalReviews: true,
          verified: true,
        },
      },
      _count: {
        select: {
          services: {
            where: {
              isActive: true,
            },
          },
        },
      },
    },
  });
};

export const getPublicServicesByUserId = async (userId: number) => {
  return prisma.service.findMany({
    where: {
      sellerId: userId,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      price: true,
      isActive: true,
      createdAt: true,
      seller: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getPublicReviewsByUserId = async (userId: number) => {
  return prisma.review.findMany({
    where: {
      revieweeId: userId,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
        },
      },
      order: {
        select: {
          id: true,
          service: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
