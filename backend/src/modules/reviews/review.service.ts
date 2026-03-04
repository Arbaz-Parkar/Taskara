import prisma from "../../utils/prisma";

const recalculateSellerRating = async (revieweeId: number) => {
  const aggregate = await prisma.review.aggregate({
    where: {
      revieweeId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  await prisma.providerProfile.upsert({
    where: { userId: revieweeId },
    update: {
      averageRating: aggregate._avg.rating ?? 0,
      totalReviews: aggregate._count.rating ?? 0,
    },
    create: {
      userId: revieweeId,
      averageRating: aggregate._avg.rating ?? 0,
      totalReviews: aggregate._count.rating ?? 0,
    },
  });
};

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
          avatarUrl: true,
        },
      },
    },
  });

  await recalculateSellerRating(order.sellerId);

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

export const getMyWrittenReviews = async (reviewerId: number) => {
  return prisma.review.findMany({
    where: {
      reviewerId,
    },
    include: {
      reviewee: {
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

export const getMyReceivedReviews = async (revieweeId: number) => {
  return prisma.review.findMany({
    where: {
      revieweeId,
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

export const updateMyWrittenReview = async (
  reviewerId: number,
  reviewId: number,
  data: {
    rating?: number;
    comment?: string;
  }
) => {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      reviewerId,
    },
    select: {
      id: true,
      revieweeId: true,
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  const nextRating = data.rating;
  if (typeof nextRating === "number" && (nextRating < 1 || nextRating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: typeof nextRating === "number" ? nextRating : undefined,
      comment:
        typeof data.comment === "string" ? data.comment.trim() || null : undefined,
    },
    include: {
      reviewee: {
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
  });

  await recalculateSellerRating(review.revieweeId);

  return updated;
};

export const deleteMyWrittenReview = async (reviewerId: number, reviewId: number) => {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      reviewerId,
    },
    select: {
      id: true,
      revieweeId: true,
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  await recalculateSellerRating(review.revieweeId);
};

export const replyToReceivedReview = async (
  revieweeId: number,
  reviewId: number,
  reply: string
) => {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      revieweeId,
    },
    select: {
      id: true,
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  const nextReply = reply.trim();
  if (!nextReply) {
    throw new Error("Reply is required");
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      sellerReply: nextReply,
      sellerReplyAt: new Date(),
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
  });
};
