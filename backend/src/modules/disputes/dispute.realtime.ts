import { Response } from "express";

type StreamResponse = Response;

const disputeStreams = new Map<number, Set<StreamResponse>>();

const writeEvent = (res: StreamResponse, event: string, data: unknown) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

export const registerDisputeMessageStream = (
  disputeId: number,
  res: StreamResponse
) => {
  const existing = disputeStreams.get(disputeId) ?? new Set<StreamResponse>();
  existing.add(res);
  disputeStreams.set(disputeId, existing);

  writeEvent(res, "connected", { disputeId });

  const heartbeat = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 25000);

  const cleanup = () => {
    clearInterval(heartbeat);
    const active = disputeStreams.get(disputeId);
    if (!active) {
      return;
    }

    active.delete(res);
    if (active.size === 0) {
      disputeStreams.delete(disputeId);
    }
  };

  res.on("close", cleanup);
  res.on("finish", cleanup);
};

export const publishDisputeMessage = (
  disputeId: number,
  message: {
    id: number;
    disputeId: number;
    senderId: number;
    content: string;
    createdAt: Date;
    sender: {
      id: number;
      name: string;
      email?: string;
      avatarUrl?: string | null;
      role?: {
        name: string;
      };
    };
    attachments?: {
      id: number;
      fileName: string;
      fileUrl: string;
      mimeType: string;
      size: number;
    }[];
  }
) => {
  const listeners = disputeStreams.get(disputeId);
  if (!listeners || listeners.size === 0) {
    return;
  }

  for (const res of listeners) {
    writeEvent(res, "message", message);
  }
};

export const publishDisputeTyping = (
  disputeId: number,
  payload: {
    disputeId: number;
    userId: number;
    isTyping: boolean;
  }
) => {
  const listeners = disputeStreams.get(disputeId);
  if (!listeners || listeners.size === 0) {
    return;
  }

  for (const res of listeners) {
    writeEvent(res, "typing", payload);
  }
};
