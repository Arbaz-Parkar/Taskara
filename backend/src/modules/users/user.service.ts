import prisma from "../../utils/prisma";
import { comparePassword, hashPassword } from "../../utils/hash";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const avatarUploadsRoot = path.resolve(process.cwd(), "uploads", "avatars");

const sanitizeFileName = (fileName: string) =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

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

export const updateMyAvatarByUserId = async (
  userId: number,
  data: {
    fileName: string;
    mimeType: string;
    dataBase64: string;
  }
) => {
  const decoded = Buffer.from(data.dataBase64, "base64");
  if (!decoded.length) {
    throw new Error("Avatar payload is empty");
  }

  await fs.mkdir(avatarUploadsRoot, { recursive: true });

  const safeName = sanitizeFileName(data.fileName || "avatar");
  const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const filePath = path.join(avatarUploadsRoot, uniqueName);
  await fs.writeFile(filePath, decoded);

  const relativeUrl = `/uploads/avatars/${uniqueName}`;

  return prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl: relativeUrl,
    },
    select: {
      id: true,
      avatarUrl: true,
    },
  });
};
