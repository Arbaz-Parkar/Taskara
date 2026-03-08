import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as disputeService from "./dispute.service";

export const getEligibleOrdersForDispute = async (req: AuthRequest, res: Response) => {
  const orders = await disputeService.getEligibleOrdersForDispute(req.user!.userId);
  return res.json(orders);
};

export const getMyDisputes = async (req: AuthRequest, res: Response) => {
  const disputes = await disputeService.getMyDisputes(req.user!.userId);
  return res.json(disputes);
};

export const createDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, reason, message, attachments } = req.body as {
      orderId?: number;
      reason?: string;
      message?: string;
      attachments?: { fileName: string; mimeType?: string; dataBase64: string }[];
    };

    if (!orderId || Number.isNaN(Number(orderId))) {
      return res.status(400).json({ message: "Valid orderId is required" });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "reason is required" });
    }

    const dispute = await disputeService.createDispute(req.user!.userId, {
      orderId: Number(orderId),
      reason,
      message,
      attachments: attachments ?? [],
    });

    return res.status(201).json(dispute);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create dispute";
    if (message === "Order not found") {
      return res.status(404).json({ message });
    }
    return res.status(400).json({ message });
  }
};

export const getDisputeById = async (req: AuthRequest, res: Response) => {
  try {
    const disputeId = Number(req.params.id);
    if (Number.isNaN(disputeId)) {
      return res.status(400).json({ message: "Invalid dispute id" });
    }

    const dispute = await disputeService.getDisputeById(
      disputeId,
      req.user!.userId,
      req.user!.role
    );
    return res.json(dispute);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load dispute";

    if (message === "Dispute not found") {
      return res.status(404).json({ message });
    }

    if (message === "You are not allowed to access this dispute") {
      return res.status(403).json({ message });
    }

    return res.status(400).json({ message });
  }
};

export const getDisputeMessages = async (req: AuthRequest, res: Response) => {
  try {
    const disputeId = Number(req.params.id);
    if (Number.isNaN(disputeId)) {
      return res.status(400).json({ message: "Invalid dispute id" });
    }

    const messages = await disputeService.getDisputeMessages(
      disputeId,
      req.user!.userId,
      req.user!.role
    );
    return res.json(messages);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load dispute messages";
    if (message === "Dispute not found") {
      return res.status(404).json({ message });
    }
    if (message === "You are not allowed to access this dispute") {
      return res.status(403).json({ message });
    }
    return res.status(400).json({ message });
  }
};

export const sendDisputeMessage = async (req: AuthRequest, res: Response) => {
  try {
    const disputeId = Number(req.params.id);
    if (Number.isNaN(disputeId)) {
      return res.status(400).json({ message: "Invalid dispute id" });
    }

    const { content, attachments } = req.body as {
      content?: string;
      attachments?: { fileName: string; mimeType?: string; dataBase64: string }[];
    };

    const hasText = Boolean(content && content.trim());
    const hasAttachments = Boolean(attachments && attachments.length > 0);

    if (!hasText && !hasAttachments) {
      return res.status(400).json({ message: "content or attachments are required" });
    }

    const message = await disputeService.createDisputeMessage(
      disputeId,
      req.user!.userId,
      req.user!.role,
      content ?? "",
      attachments ?? []
    );

    return res.status(201).json(message);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send dispute message";

    if (message === "Dispute not found") {
      return res.status(404).json({ message });
    }

    if (message === "You are not allowed to access this dispute") {
      return res.status(403).json({ message });
    }

    return res.status(400).json({ message });
  }
};

export const updateDisputeStatusAsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const disputeId = Number(req.params.id);
    const { status } = req.body as { status?: disputeService.DisputeStatusValue };

    if (Number.isNaN(disputeId)) {
      return res.status(400).json({ message: "Invalid dispute id" });
    }

    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const dispute = await disputeService.updateDisputeStatusByAdmin(disputeId, status);
    return res.json(dispute);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update dispute status";
    if (message === "Dispute not found") {
      return res.status(404).json({ message });
    }
    return res.status(400).json({ message });
  }
};
