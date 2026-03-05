import prisma from "../../utils/prisma";
import { comparePassword, hashPassword } from "../../utils/hash";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const avatarUploadsRoot = path.resolve(process.cwd(), "uploads", "avatars");
const ADMIN_EMAIL = "admin@taskara.com";

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
          avatarUrl: true,
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

export const exportMyAccountDataByUserId = async (userId: number) => {
  const [profile, services, buyerOrders, sellerOrders, messages, reviewsGiven, reviewsReceived] =
    await Promise.all([
      prisma.user.findUnique({
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
          isActive: true,
          createdAt: true,
          providerProfile: true,
        },
      }),
      prisma.service.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        where: { buyerId: userId },
        include: {
          service: true,
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          review: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        where: { sellerId: userId },
        include: {
          service: true,
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          review: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.orderMessage.findMany({
        where: { senderId: userId },
        include: {
          attachments: true,
          order: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.findMany({
        where: { reviewerId: userId },
        include: {
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.findMany({
        where: { revieweeId: userId },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
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
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return {
    exportedAt: new Date().toISOString(),
    profile,
    services,
    buyerOrders,
    sellerOrders,
    messages,
    reviewsGiven,
    reviewsReceived,
  };
};

export const deactivateMyAccountByUserId = async (
  userId: number,
  currentPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
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

  await prisma.$transaction([
    prisma.service.updateMany({
      where: {
        sellerId: userId,
      },
      data: {
        isActive: false,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
      },
    }),
  ]);
};

export const deleteMyAccountByUserId = async (
  userId: number,
  currentPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
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

  await prisma.$transaction(async (tx) => {
    await tx.orderMessageAttachment.deleteMany({
      where: {
        message: {
          OR: [
            { senderId: userId },
            { order: { buyerId: userId } },
            { order: { sellerId: userId } },
          ],
        },
      },
    });

    await tx.orderMessage.deleteMany({
      where: {
        OR: [
          { senderId: userId },
          { order: { buyerId: userId } },
          { order: { sellerId: userId } },
        ],
      },
    });

    await tx.review.deleteMany({
      where: {
        OR: [{ reviewerId: userId }, { revieweeId: userId }],
      },
    });

    await tx.order.deleteMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });

    await tx.service.deleteMany({
      where: {
        sellerId: userId,
      },
    });

    await tx.providerProfile.deleteMany({
      where: {
        userId,
      },
    });

    await tx.user.delete({
      where: { id: userId },
    });
  });
};

export const getAdminUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      role: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          services: true,
          buyerOrders: true,
          sellerOrders: true,
          reviewsReceived: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map((user) => ({
    ...user,
    role: {
      name: user.email.toLowerCase() === ADMIN_EMAIL ? "admin" : "user",
    },
  }));
};

export const updateAdminUserStatus = async (
  targetUserId: number,
  isActive: boolean,
  actingAdminUserId: number
) => {
  if (targetUserId === actingAdminUserId) {
    throw new Error("Admin cannot change own active status");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
    },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  return prisma.$transaction(async (tx) => {
    if (!isActive) {
      await tx.service.updateMany({
        where: {
          sellerId: targetUserId,
        },
        data: {
          isActive: false,
        },
      });
    }

    return tx.user.update({
      where: { id: targetUserId },
      data: {
        isActive,
      },
      select: {
        id: true,
        isActive: true,
      },
    });
  });
};
