import prisma from "../../utils/prisma";

export const createReview = async (
  reviewerId: number,
  data: {
    orderId: number;
    rating: number;
    comment?: string;
  }
) => {
  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "COMPLETED") {
    throw new Error("Review can only be created for completed orders");
  }

  if (order.buyerId !== reviewerId) {
    throw new Error("Only the buyer can review this order");
  }

  const existingReview = await prisma.review.findUnique({
    where: { orderId: data.orderId },
  });

  if (existingReview) {
    throw new Error("Review already exists for this order");
  }

  const review = await prisma.review.create({
    data: {
      orderId: order.id,
      reviewerId,
      revieweeId: order.sellerId,
      rating: data.rating,
      comment: data.comment?.trim() || null,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const aggregate = await prisma.review.aggregate({
    where: {
      revieweeId: order.sellerId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  await prisma.providerProfile.upsert({
    where: { userId: order.sellerId },
    update: {
      averageRating: aggregate._avg.rating ?? 0,
      totalReviews: aggregate._count.rating ?? 0,
    },
    create: {
      userId: order.sellerId,
      averageRating: aggregate._avg.rating ?? 0,
      totalReviews: aggregate._count.rating ?? 0,
    },
  });

  return review;
};

export const getReviewsByUser = async (revieweeId: number) => {
  return prisma.review.findMany({
    where: { revieweeId },
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
