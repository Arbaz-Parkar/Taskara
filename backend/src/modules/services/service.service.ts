import prisma from "../../utils/prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_SERVICE_IMAGES = 5;
const MAX_SERVICE_IMAGE_BYTES = 8 * 1024 * 1024;
const uploadsRoot = path.resolve(process.cwd(), "uploads", "services");

type ServiceImageInput = {
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
  dataBase64?: string;
};

const sanitizeFileName = (fileName: string) =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

const buildServiceImageUrl = (filePath: string) => {
  const relativePath = path
    .relative(path.resolve(process.cwd(), "uploads"), filePath)
    .split(path.sep)
    .join("/");

  return `/uploads/${relativePath}`;
};

const serviceInclude = {
  seller: {
    select: {
      id: true,
      name: true,
    },
  },
  images: {
    select: {
      id: true,
      fileUrl: true,
      sortOrder: true,
    },
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
};

export type ServiceSearchFilters = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  responseSpeed?: "FAST" | "DAY" | "SLOW";
  sort?:
    | "BEST_MATCH"
    | "PRICE_LOW_HIGH"
    | "PRICE_HIGH_LOW"
    | "RATING_HIGH_LOW"
    | "RESPONSE_FAST";
};

type ServiceWithSignals = Awaited<ReturnType<typeof prisma.service.findMany>>[number] & {
  averageRating: number;
  totalReviews: number;
  responseHours: number | null;
  responseTier: "FAST" | "DAY" | "SLOW" | "UNKNOWN";
  bestMatchScore: number;
};

const computeTextMatchScore = (service: { title: string; description: string; category: string }, q: string) => {
  const query = q.trim().toLowerCase();
  if (!query) {
    return 0;
  }

  const title = service.title.toLowerCase();
  const description = service.description.toLowerCase();
  const category = service.category.toLowerCase();

  let score = 0;
  if (title === query) score += 60;
  if (title.includes(query)) score += 35;
  if (category.includes(query)) score += 25;
  if (description.includes(query)) score += 20;

  const terms = query.split(/\s+/).filter(Boolean);
  terms.forEach((term) => {
    if (title.includes(term)) score += 8;
    if (category.includes(term)) score += 5;
    if (description.includes(term)) score += 3;
  });

  return Math.min(score, 80);
};

const persistServiceImages = async (
  serviceId: number,
  images: ServiceImageInput[] | undefined
) => {
  if (!images) {
    return;
  }

  if (images.length > MAX_SERVICE_IMAGES) {
    throw new Error(`You can upload up to ${MAX_SERVICE_IMAGES} images per service`);
  }

  const imageRows: { serviceId: number; fileUrl: string; sortOrder: number }[] = [];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];

    if (image.fileUrl) {
      imageRows.push({
        serviceId,
        fileUrl: image.fileUrl,
        sortOrder: index,
      });
      continue;
    }

    if (!image.dataBase64) {
      throw new Error("Invalid image payload");
    }

    const decoded = Buffer.from(image.dataBase64, "base64");
    if (!decoded.length) {
      throw new Error("Image payload is empty");
    }

    if (decoded.length > MAX_SERVICE_IMAGE_BYTES) {
      throw new Error("Each image must be 8 MB or less");
    }

    const fileName = sanitizeFileName(image.fileName || "service-image");
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${fileName}`;
    const outputDir = path.join(uploadsRoot, String(serviceId));
    await fs.mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, uniqueName);
    await fs.writeFile(outputPath, decoded);

    imageRows.push({
      serviceId,
      fileUrl: buildServiceImageUrl(outputPath),
      sortOrder: index,
    });
  }

  await prisma.serviceImage.deleteMany({
    where: { serviceId },
  });

  if (imageRows.length > 0) {
    await prisma.serviceImage.createMany({
      data: imageRows,
    });
  }
};

export const createService = async (
  userId: number,
  data: {
    title: string;
    description: string;
    category: string;
    price: number;
    images?: ServiceImageInput[];
  }
) => {
  const service = await prisma.service.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      price: data.price,
      sellerId: userId,
    },
  });

  await persistServiceImages(service.id, data.images);

  return prisma.service.findUnique({
    where: { id: service.id },
    include: serviceInclude,
  });
};

export const getAllServices = async (filters: ServiceSearchFilters = {}) => {
  const where: any = { isActive: true };

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { seller: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (filters.category?.trim()) {
    where.category = { contains: filters.category.trim(), mode: "insensitive" };
  }

  if (typeof filters.minPrice === "number" || typeof filters.maxPrice === "number") {
    where.price = {};
    if (typeof filters.minPrice === "number") where.price.gte = filters.minPrice;
    if (typeof filters.maxPrice === "number") where.price.lte = filters.maxPrice;
  }

  const baseServices = await prisma.service.findMany({
    where,
    include: serviceInclude,
    orderBy: { createdAt: "desc" },
  });

  if (baseServices.length === 0) {
    return [];
  }

  const sellerIds = Array.from(new Set(baseServices.map((service) => service.sellerId)));
  const providerProfiles = await prisma.providerProfile.findMany({
    where: {
      userId: {
        in: sellerIds,
      },
    },
    select: {
      userId: true,
      averageRating: true,
      totalReviews: true,
    },
  });

  const responseOrders = await prisma.order.findMany({
    where: {
      sellerId: {
        in: sellerIds,
      },
    },
    select: {
      id: true,
      createdAt: true,
      sellerId: true,
      messages: {
        where: {
          senderId: {
            in: sellerIds,
          },
        },
        select: {
          senderId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  const ratingBySeller = new Map(providerProfiles.map((profile) => [profile.userId, profile]));
  const responseSamplesBySeller = new Map<number, number[]>();

  responseOrders.forEach((order) => {
    const firstSellerMessage = order.messages.find((message) => message.senderId === order.sellerId);
    if (!firstSellerMessage) {
      return;
    }

    const diffHours =
      (new Date(firstSellerMessage.createdAt).getTime() - new Date(order.createdAt).getTime()) /
      (1000 * 60 * 60);

    if (diffHours < 0 || !Number.isFinite(diffHours)) {
      return;
    }

    const current = responseSamplesBySeller.get(order.sellerId) ?? [];
    current.push(diffHours);
    responseSamplesBySeller.set(order.sellerId, current);
  });

  const withSignals: ServiceWithSignals[] = baseServices.map((service) => {
    const rating = ratingBySeller.get(service.sellerId);
    const averageRating = rating?.averageRating ?? 0;
    const totalReviews = rating?.totalReviews ?? 0;
    const responseSamples = responseSamplesBySeller.get(service.sellerId) ?? [];
    const responseHours =
      responseSamples.length > 0
        ? responseSamples.reduce((sum, value) => sum + value, 0) / responseSamples.length
        : null;

    const responseTier: "FAST" | "DAY" | "SLOW" | "UNKNOWN" =
      responseHours == null
        ? "UNKNOWN"
        : responseHours <= 4
          ? "FAST"
          : responseHours <= 24
            ? "DAY"
            : "SLOW";

    return {
      ...service,
      averageRating,
      totalReviews,
      responseHours,
      responseTier,
      bestMatchScore: 0,
    };
  });

  const minPrice = Math.min(...withSignals.map((service) => service.price));
  const maxPrice = Math.max(...withSignals.map((service) => service.price));
  const priceRange = maxPrice - minPrice || 1;

  const filteredBySignals = withSignals.filter((service) => {
    const ratingOk =
      typeof filters.minRating !== "number" || service.averageRating >= filters.minRating;

    const speedOk =
      !filters.responseSpeed ||
      (filters.responseSpeed === "FAST" && service.responseTier === "FAST") ||
      (filters.responseSpeed === "DAY" &&
        (service.responseTier === "FAST" || service.responseTier === "DAY")) ||
      (filters.responseSpeed === "SLOW" && service.responseTier === "SLOW");

    return ratingOk && speedOk;
  });

  const q = filters.q?.trim() ?? "";

  filteredBySignals.forEach((service) => {
    const textScore = computeTextMatchScore(service, q);
    const ratingScore = (service.averageRating / 5) * 25;
    const priceScore = ((maxPrice - service.price) / priceRange) * 20;
    const responseScore =
      service.responseTier === "FAST"
        ? 20
        : service.responseTier === "DAY"
          ? 12
          : service.responseTier === "SLOW"
            ? 5
            : 8;

    const reviewTrustScore = Math.min(service.totalReviews, 20) * 0.5;
    service.bestMatchScore = Number(
      (textScore + ratingScore + priceScore + responseScore + reviewTrustScore).toFixed(2)
    );
  });

  const sortMode = filters.sort ?? "BEST_MATCH";
  filteredBySignals.sort((a, b) => {
    if (sortMode === "PRICE_LOW_HIGH") return a.price - b.price;
    if (sortMode === "PRICE_HIGH_LOW") return b.price - a.price;
    if (sortMode === "RATING_HIGH_LOW") return b.averageRating - a.averageRating;
    if (sortMode === "RESPONSE_FAST") {
      const ah = a.responseHours == null ? Number.POSITIVE_INFINITY : a.responseHours;
      const bh = b.responseHours == null ? Number.POSITIVE_INFINITY : b.responseHours;
      return ah - bh;
    }
    return b.bestMatchScore - a.bestMatchScore;
  });

  return filteredBySignals;
};

export const getServicesBySeller = async (userId: number) => {
  return prisma.service.findMany({
    where: {
      sellerId: userId,
    },
    include: serviceInclude,
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
    images?: ServiceImageInput[];
  }
) => {
  const existing = await prisma.service.findFirst({
    where: {
      id: serviceId,
      sellerId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    return null;
  }

  await prisma.service.update({
    where: {
      id: serviceId,
    },
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      price: data.price,
    },
  });

  await persistServiceImages(serviceId, data.images);

  return prisma.service.findUnique({
    where: { id: serviceId },
    include: serviceInclude,
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
    include: serviceInclude,
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
    include: serviceInclude,
  });
};

export const getAdminServices = async () => {
  return prisma.service.findMany({
    include: {
      ...serviceInclude,
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
      ...serviceInclude,
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
