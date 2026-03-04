import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  createReview,
  deleteMyWrittenReview,
  getMyReceivedReviews,
  getMyWrittenReviews,
  replyToReceivedReview,
  updateMyWrittenReview,
} from "./review.controller";

const router = Router();

router.get("/mine/written", authenticate, getMyWrittenReviews);
router.get("/mine/received", authenticate, getMyReceivedReviews);
router.patch("/:reviewId", authenticate, updateMyWrittenReview);
router.delete("/:reviewId", authenticate, deleteMyWrittenReview);
router.patch("/:reviewId/reply", authenticate, replyToReceivedReview);
router.post("/", authenticate, createReview);

export default router;
