import { Response } from "express";
import type { OrderMessage } from "@prisma/client";

type StreamResponse = Response;

const orderStreams = new Map<number, Set<StreamResponse>>();

const writeEvent = (res: StreamResponse, event: string, data: unknown) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

export const registerOrderMessageStream = (
  orderId: number,
  res: StreamResponse
) => {
  const existing = orderStreams.get(orderId) ?? new Set<StreamResponse>();
  existing.add(res);
  orderStreams.set(orderId, existing);

  writeEvent(res, "connected", { orderId });

  const heartbeat = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 25000);

  const cleanup = () => {
    clearInterval(heartbeat);
    const active = orderStreams.get(orderId);
    if (!active) {
      return;
    }

    active.delete(res);
    if (active.size === 0) {
      orderStreams.delete(orderId);
    }
  };

  res.on("close", cleanup);
  res.on("finish", cleanup);
};

export const publishOrderMessage = (
  orderId: number,
  message: OrderMessage & {
    sender: {
      id: number;
      name: string;
      avatarUrl?: string | null;
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
  const listeners = orderStreams.get(orderId);
  if (!listeners || listeners.size === 0) {
    return;
  }

  for (const res of listeners) {
    writeEvent(res, "message", message);
  }
};

export const publishOrderTyping = (
  orderId: number,
  payload: {
    orderId: number;
    userId: number;
    isTyping: boolean;
  }
) => {
  const listeners = orderStreams.get(orderId);
  if (!listeners || listeners.size === 0) {
    return;
  }

  for (const res of listeners) {
    writeEvent(res, "typing", payload);
  }
};
