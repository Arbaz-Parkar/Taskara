import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { createReview } from "./review.controller";

const router = Router();

router.post("/", authenticate, createReview);

export default router;
