import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as service from "./service.service";

export const createService = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const newService = await service.createService(
      req.user!.userId,
      req.body
    );
    return res.json(newService);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create service";
    return res.status(400).json({ message });
  }
};

export const getServices = async (_: any, res: Response) => {
  const services = await service.getAllServices();
  res.json(services);
};

export const getMyServices = async (req: AuthRequest, res: Response) => {
  const services = await service.getServicesBySeller(req.user!.userId);
  res.json(services);
};

export const updateMyService = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await service.updateServiceBySeller(req.user!.userId, id, req.body);

    if (!data) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update service";
    return res.status(400).json({ message });
  }
};

export const updateMyServiceStatus = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { isActive } = req.body as { isActive?: boolean };

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ message: "isActive must be a boolean" });
  }

  const data = await service.setServiceStatusBySeller(req.user!.userId, id, isActive);

  if (!data) {
    return res.status(404).json({ message: "Service not found" });
  }

  return res.json(data);
};

export const deleteMyService = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const deleted = await service.deleteServiceBySeller(req.user!.userId, id);

  if (!deleted) {
    return res.status(404).json({ message: "Service not found" });
  }

  return res.json({ message: "Service deleted successfully" });
};

export const getService = async (req: any, res: Response) => {
  const id = Number(req.params.id);
  const data = await service.getServiceById(id);
  if (!data) {
    return res.status(404).json({ message: "Service not found" });
  }
  res.json(data);
};

export const getAdminServices = async (_req: AuthRequest, res: Response) => {
  const services = await service.getAdminServices();
  return res.json(services);
};

export const updateAdminServiceStatus = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { isActive } = req.body as { isActive?: boolean };

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid service id" });
  }

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ message: "isActive must be a boolean" });
  }

  const data = await service.setServiceStatusByAdmin(id, isActive);

  if (!data) {
    return res.status(404).json({ message: "Service not found" });
  }

  return res.json(data);
};

export const deleteAdminService = async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid service id" });
  }

  const deleted = await service.deleteServiceByAdmin(id);

  if (!deleted) {
    return res.status(404).json({ message: "Service not found" });
  }

  return res.json({ message: "Service deleted successfully" });
};
