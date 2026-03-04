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

export const updateMyAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const { fileName, mimeType, dataBase64 } = req.body as {
      fileName?: string;
      mimeType?: string;
      dataBase64?: string;
    };

    if (!fileName || !mimeType || !dataBase64) {
      return res
        .status(400)
        .json({ message: "fileName, mimeType, and dataBase64 are required" });
    }

    if (!mimeType.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    const estimatedBytes = Math.floor((dataBase64.length * 3) / 4);
    if (estimatedBytes > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "Avatar must be 5 MB or less" });
    }

    const updated = await userService.updateMyAvatarByUserId(req.user!.userId, {
      fileName,
      mimeType,
      dataBase64,
    });

    return res.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update avatar";
    return res.status(400).json({ message });
  }
};

export const exportMyAccountData = async (req: AuthRequest, res: Response) => {
  try {
    const data = await userService.exportMyAccountDataByUserId(req.user!.userId);
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export account data";
    return res.status(400).json({ message });
  }
};

export const deactivateMyAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword } = req.body as { currentPassword?: string };

    if (!currentPassword) {
      return res.status(400).json({ message: "currentPassword is required" });
    }

    await userService.deactivateMyAccountByUserId(req.user!.userId, currentPassword);
    return res.json({ message: "Account deactivated successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to deactivate account";
    if (message === "Current password is incorrect") {
      return res.status(401).json({ message });
    }
    return res.status(400).json({ message });
  }
};

export const deleteMyAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, confirmationText } = req.body as {
      currentPassword?: string;
      confirmationText?: string;
    };

    if (!currentPassword) {
      return res.status(400).json({ message: "currentPassword is required" });
    }

    if (confirmationText !== "DELETE") {
      return res.status(400).json({ message: "confirmationText must be DELETE" });
    }

    await userService.deleteMyAccountByUserId(req.user!.userId, currentPassword);
    return res.json({ message: "Account deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete account";
    if (message === "Current password is incorrect") {
      return res.status(401).json({ message });
    }
    return res.status(400).json({ message });
  }
};
