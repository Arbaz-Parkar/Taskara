import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
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

export const getMySettings = async (req: AuthRequest, res: Response) => {
  const settings = await userService.getMySettingsByUserId(req.user!.userId);
  if (!settings) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(settings);
};

export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const updated = await userService.updateMyProfileByUserId(req.user!.userId, req.body);
    return res.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return res.status(400).json({ message });
  }
};

export const updateMyPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const updated = await userService.updateMyPreferencesByUserId(req.user!.userId, req.body);
    return res.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update preferences";
    return res.status(400).json({ message });
  }
};

export const updateMyProviderProfile = async (req: AuthRequest, res: Response) => {
  try {
    const payload = {
      bio: req.body.bio ?? null,
      experienceYears:
        typeof req.body.experienceYears === "number" ? req.body.experienceYears : null,
      baseHourlyRate:
        typeof req.body.baseHourlyRate === "number" ? req.body.baseHourlyRate : null,
      serviceRadiusKm:
        typeof req.body.serviceRadiusKm === "number" ? req.body.serviceRadiusKm : null,
    };

    const updated = await userService.upsertMyProviderProfileByUserId(
      req.user!.userId,
      payload
    );
    return res.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update provider profile";
    return res.status(400).json({ message });
  }
};

export const updateMyPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "currentPassword and newPassword are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    await userService.updateMyPasswordByUserId(
      req.user!.userId,
      currentPassword,
      newPassword
    );
    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update password";

    if (message === "Current password is incorrect") {
      return res.status(401).json({ message });
    }

    return res.status(400).json({ message });
  }
};
