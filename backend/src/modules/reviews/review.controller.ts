import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as reviewService from "./review.service";

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
