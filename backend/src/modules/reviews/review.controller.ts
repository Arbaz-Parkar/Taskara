import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as reviewService from "./review.service";

const parseReviewId = (value: string | string[] | undefined) => {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, rating, comment } = req.body as {
      orderId?: number;
      rating?: number;
      comment?: string;
    };

    if (!orderId || !rating) {
      return res.status(400).json({ message: "orderId and rating are required" });
    }

    const review = await reviewService.createReview(req.user!.userId, {
      orderId: Number(orderId),
      rating: Number(rating),
      comment,
    });

    return res.status(201).json(review);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create review";

    if (message === "Order not found") {
      return res.status(404).json({ message });
    }

    return res.status(400).json({ message });
  }
};

export const getMyWrittenReviews = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await reviewService.getMyWrittenReviews(req.user!.userId);
    return res.json(reviews);
  } catch {
    return res.status(500).json({ message: "Failed to fetch written reviews" });
  }
};

export const getMyReceivedReviews = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await reviewService.getMyReceivedReviews(req.user!.userId);
    return res.json(reviews);
  } catch {
    return res.status(500).json({ message: "Failed to fetch received reviews" });
  }
};

export const updateMyWrittenReview = async (req: AuthRequest, res: Response) => {
  const reviewId = parseReviewId(req.params.reviewId);
  if (!reviewId) {
    return res.status(400).json({ message: "Invalid review id" });
  }

  try {
    const { rating, comment } = req.body as {
      rating?: number;
      comment?: string;
    };

    if (typeof rating !== "number" && typeof comment !== "string") {
      return res.status(400).json({ message: "rating or comment must be provided" });
    }

    const updated = await reviewService.updateMyWrittenReview(
      req.user!.userId,
      reviewId,
      {
        rating: typeof rating === "number" ? Number(rating) : undefined,
        comment: typeof comment === "string" ? comment : undefined,
      }
    );

    return res.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update review";
    if (message === "Review not found") {
      return res.status(404).json({ message });
    }
    return res.status(400).json({ message });
  }
};

export const deleteMyWrittenReview = async (req: AuthRequest, res: Response) => {
  const reviewId = parseReviewId(req.params.reviewId);
  if (!reviewId) {
    return res.status(400).json({ message: "Invalid review id" });
  }

  try {
    await reviewService.deleteMyWrittenReview(req.user!.userId, reviewId);
    return res.json({ message: "Review deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete review";
    if (message === "Review not found") {
      return res.status(404).json({ message });
    }
    return res.status(400).json({ message });
  }
};

export const replyToReceivedReview = async (req: AuthRequest, res: Response) => {
  const reviewId = parseReviewId(req.params.reviewId);
  if (!reviewId) {
    return res.status(400).json({ message: "Invalid review id" });
  }

  try {
    const { reply } = req.body as { reply?: string };

    if (!reply) {
      return res.status(400).json({ message: "reply is required" });
    }

    const updated = await reviewService.replyToReceivedReview(
      req.user!.userId,
      reviewId,
      reply
    );
    return res.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reply to review";
    if (message === "Review not found") {
      return res.status(404).json({ message });
    }
    return res.status(400).json({ message });
  }
};
