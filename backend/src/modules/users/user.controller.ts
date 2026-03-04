import { Request, Response } from "express";
import * as userService from "./user.service";

export const getPublicUserProfile = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const user = await userService.getPublicUserById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { _count, ...rest } = user;

  return res.json({
    ...rest,
    activeServicesCount: _count.services,
  });
};

export const getPublicUserServices = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const user = await userService.getPublicUserById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const services = await userService.getPublicServicesByUserId(userId);
  return res.json(services);
};

export const getPublicUserReviews = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const user = await userService.getPublicUserById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const reviews = await userService.getPublicReviewsByUserId(userId);
  return res.json(reviews);
};
