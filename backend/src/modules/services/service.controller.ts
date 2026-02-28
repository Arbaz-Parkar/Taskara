import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as service from "./service.service";

export const createService = async (
  req: AuthRequest,
  res: Response
) => {
  const newService = await service.createService(
    req.user!.userId, 
    req.body
  );

  res.json(newService);
};

export const getServices = async (_: any, res: Response) => {
  const services = await service.getAllServices();
  res.json(services);
};

export const getService = async (req: any, res: Response) => {
  const id = Number(req.params.id);
  const data = await service.getServiceById(id);
  res.json(data);
};