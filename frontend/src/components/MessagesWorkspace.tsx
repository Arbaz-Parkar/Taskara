import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  fetchBuyerOrders,
  fetchOrderMessages,
  fetchSellerOrders,
  getCurrentUser,
  sendOrderMessage,
} from "../utils/api";
import type { OrderMessage, OrderStatus } from "../utils/api";

type OrderRecord = {
  id: number;
  status: OrderStatus;
  amount: number;
  requirements?: string;
  createdAt: string;
  service: {
    id: number;
    title: string;
    category: string;
  };
  buyer: {
    id: number;
    name: string;
  };
  seller: {
    id: number;
    name: string;
  };
};

type MessagesWorkspaceProps = {
  selectedOrderId?: string;
};

const statusLabel = (status: string) => status.replaceAll("_", " ");
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

type PendingAttachment = {
  id: string;
  file: File;
};

const formatBytes = (value: number) => {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const MessagesWorkspace = ({ selectedOrderId }: MessagesWorkspaceProps) => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(0);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [messagesByOrder, setMessagesByOrder] = useState<Record<number, OrderMessage[]>>({});
  const [loadingMessagesOrderId, setLoadingMessagesOrderId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [user, buyerData, sellerData] = await Promise.all([
          getCurrentUser(),
          fetchBuyerOrders(),
          fetchSellerOrders(),
        ]);

        setCurrentUserId(user.user.userId ?? 0);

        const map = new Map<number, OrderRecord>();
        [...buyerData, ...sellerData].forEach((order) => {
          map.set(order.id, order);
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(merged);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load conversations");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (normalized.length === 0) {
      return orders;
    }

    return orders.filter((order) => {
      const counterpartyName =
        order.buyer.id === currentUserId ? order.seller.name : order.buyer.name;

      return (
        String(order.id).includes(normalized) ||
        order.service.title.toLowerCase().includes(normalized) ||
        counterpartyName.toLowerCase().includes(normalized)
      );
    });
  }, [orders, query, currentUserId]);

  const selectedOrder = filteredOrders.find((order) => String(order.id) === selectedOrderId) ?? null;

  useEffect(() => {
    if (!selectedOrderId && filteredOrders.length > 0) {
      navigate(`/dashboard/messages/${filteredOrders[0].id}`, { replace: true });
    }
  }, [selectedOrderId, filteredOrders, navigate]);

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    if (messagesByOrder[selectedOrder.id]) {
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      try {
        setLoadingMessagesOrderId(selectedOrder.id);
        const data = await fetchOrderMessages(selectedOrder.id);

        if (!cancelled) {
          setMessagesByOrder((current) => ({ ...current, [selectedOrder.id]: data }));
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Failed to load messages");
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingMessagesOrderId(null);
        }
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedOrder, messagesByOrder]);

  const handleSend = async () => {
    if (!selectedOrder) {
      return;
    }

    const content = draft.trim();
    if (!content && pendingAttachments.length === 0) {
      return;
    }

    const attachmentSummary =
      pendingAttachments.length === 0
        ? ""
        : `\n\nAttachments:\n${pendingAttachments
            .map(
              ({ file }) =>
                `- ${file.name} (${formatBytes(file.size)}, ${file.type || "Unknown type"})`
            )
            .join("\n")}`;

    const payload = `${content || "Shared file delivery"}${attachmentSummary}`.trim();

    try {
      setSending(true);
      setError("");
      const message = await sendOrderMessage(selectedOrder.id, payload);
      setMessagesByOrder((current) => ({
        ...current,
        [selectedOrder.id]: [...(current[selectedOrder.id] ?? []), message],
      }));
      setDraft("");
      setPendingAttachments([]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send message");
      }
    } finally {
      setSending(false);
    }
  };

  const handleAttachmentSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    const validFiles: PendingAttachment[] = [];
    let oversizeFound = false;

    files.forEach((file) => {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        oversizeFound = true;
        return;
      }

      const id = `${file.name}-${file.size}-${file.lastModified}`;
      validFiles.push({ id, file });
    });

    setPendingAttachments((current) => {
      const existing = new Set(current.map((item) => item.id));
      const merged = [...current];

      validFiles.forEach((item) => {
        if (!existing.has(item.id)) {
          merged.push(item);
        }
      });

      return merged;
    });

    if (oversizeFound) {
      setError("One or more files were skipped because they exceed 10 MB.");
    } else {
      setError("");
    }

    event.target.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setPendingAttachments((current) => current.filter((item) => item.id !== id));
  };

  if (loading) {
    return <div className="dashboard-placeholder">Loading conversations...</div>;
  }

  if (error && orders.length === 0) {
    return (
      <div className="dashboard-placeholder">
        <h2>Could not load conversations</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="dashboard-placeholder">
        <h2>No conversations yet</h2>
        <p>Chats unlock automatically once you place or receive an order.</p>
      </div>
    );
  }

  return (
    <section className="messages-shell">
      <aside className="messages-list-panel">
        <h3>Order Conversations</h3>
        <input
          className="manage-search"
          placeholder="Search by order, service, or name"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="messages-list">
          {filteredOrders.map((order) => {
            const counterpartyName =
              order.buyer.id === currentUserId ? order.seller.name : order.buyer.name;

            return (
              <NavLink
                key={order.id}
                to={`/dashboard/messages/${order.id}`}
                className={({ isActive }) => `message-thread-btn ${isActive ? "active" : ""}`}
              >
                <strong>{counterpartyName}</strong>
                <span>{order.service.title}</span>
                <small>Order #{order.id}</small>
              </NavLink>
            );
          })}
        </div>
      </aside>

      <div className="messages-chat-panel">
        {selectedOrder ? (
          <>
            <div className="messages-chat-head">
              <h3>{selectedOrder.service.title}</h3>
              <p>
                Order #{selectedOrder.id} | Status: {statusLabel(selectedOrder.status)}
              </p>
            </div>

            {error && <p className="form-status form-status-error">{error}</p>}

            <div className="messages-chat-list">
              {loadingMessagesOrderId === selectedOrder.id ? (
                <p className="service-seller">Loading messages...</p>
              ) : (messagesByOrder[selectedOrder.id] ?? []).length === 0 ? (
                <p className="service-seller">No messages yet. Start the discussion.</p>
              ) : (
                (messagesByOrder[selectedOrder.id] ?? []).map((message) => (
                  <div
                    key={message.id}
                    className={`order-chat-item ${
                      message.senderId === currentUserId ? "outgoing" : "incoming"
                    }`}
                  >
                    <strong>{message.sender.name}</strong>
                    <p className="message-content-pre">{message.content}</p>
                  </div>
                ))
              )}
            </div>

            <div className="order-chat-compose">
              <input
                placeholder="Type your message..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <label className="message-attach-btn" aria-label="Attach files">
                Attach
                <input type="file" multiple onChange={handleAttachmentSelect} />
              </label>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>

            {pendingAttachments.length > 0 && (
              <div className="message-attachment-list">
                {pendingAttachments.map(({ id, file }) => (
                  <div key={id} className="message-attachment-chip">
                    <span>{`${file.name} (${formatBytes(file.size)})`}</span>
                    <button type="button" onClick={() => handleRemoveAttachment(id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="messages-upnext-note">
              Attachments are delivered as secure file metadata in the chat thread.
            </div>
          </>
        ) : (
          <div className="dashboard-placeholder compact-placeholder">
            <h2>Conversation not found</h2>
            <p>Select another order conversation from the left panel.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MessagesWorkspace;
