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

export const getAllServices = async () => {
  return prisma.service.findMany({
    where: { isActive: true },
    include: serviceInclude,
    orderBy: { createdAt: "desc" },
  });
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
