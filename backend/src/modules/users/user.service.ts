import prisma from "../../utils/prisma";
import { comparePassword, hashPassword } from "../../utils/hash";

export const getPublicUserById = async (userId: number) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      title: true,
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

export const getMySettingsByUserId = async (userId: number) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      title: true,
      country: true,
      timezone: true,
      language: true,
      currency: true,
      emailNotifications: true,
      orderNotifications: true,
      messageNotifications: true,
      marketingNotifications: true,
      profileVisibility: true,
      showOnlineStatus: true,
      createdAt: true,
      providerProfile: {
        select: {
          bio: true,
          experienceYears: true,
          baseHourlyRate: true,
          serviceRadiusKm: true,
          verified: true,
          averageRating: true,
          totalReviews: true,
        },
      },
    },
  });
};

export const updateMyProfileByUserId = async (
  userId: number,
  data: {
    name?: string;
    phone?: string | null;
    avatarUrl?: string | null;
    title?: string | null;
    country?: string | null;
  }
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      title: data.title,
      country: data.country,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      title: true,
      country: true,
    },
  });
};

export const updateMyPreferencesByUserId = async (
  userId: number,
  data: {
    timezone?: string;
    language?: string;
    currency?: string;
    emailNotifications?: boolean;
    orderNotifications?: boolean;
    messageNotifications?: boolean;
    marketingNotifications?: boolean;
    profileVisibility?: string;
    showOnlineStatus?: boolean;
  }
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      timezone: data.timezone,
      language: data.language,
      currency: data.currency,
      emailNotifications: data.emailNotifications,
      orderNotifications: data.orderNotifications,
      messageNotifications: data.messageNotifications,
      marketingNotifications: data.marketingNotifications,
      profileVisibility: data.profileVisibility,
      showOnlineStatus: data.showOnlineStatus,
    },
    select: {
      id: true,
      timezone: true,
      language: true,
      currency: true,
      emailNotifications: true,
      orderNotifications: true,
      messageNotifications: true,
      marketingNotifications: true,
      profileVisibility: true,
      showOnlineStatus: true,
    },
  });
};

export const upsertMyProviderProfileByUserId = async (
  userId: number,
  data: {
    bio?: string | null;
    experienceYears?: number | null;
    baseHourlyRate?: number | null;
    serviceRadiusKm?: number | null;
  }
) => {
  return prisma.providerProfile.upsert({
    where: { userId },
    update: {
      bio: data.bio,
      experienceYears: data.experienceYears,
      baseHourlyRate: data.baseHourlyRate,
      serviceRadiusKm: data.serviceRadiusKm,
    },
    create: {
      userId,
      bio: data.bio,
      experienceYears: data.experienceYears,
      baseHourlyRate: data.baseHourlyRate,
      serviceRadiusKm: data.serviceRadiusKm,
    },
  });
};

export const updateMyPasswordByUserId = async (
  userId: number,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      passwordHash: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new Error("Current password is incorrect");
  }

  const nextHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: nextHash,
    },
  });
};
