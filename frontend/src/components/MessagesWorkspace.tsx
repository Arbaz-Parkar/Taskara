import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  fetchBuyerOrders,
  fetchOrderMessages,
  fetchSellerOrders,
  getCurrentUser,
  resolveMediaUrl,
  sendOrderMessage,
} from "../utils/api";
import type { OrderMessage, OrderStatus } from "../utils/api";

type MessagesMode = "all" | "buyer" | "seller";

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
    avatarUrl?: string | null;
  };
  seller: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
};

type MessagesWorkspaceProps = {
  mode?: MessagesMode;
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

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      if (!base64) {
        reject(new Error("Failed to encode attachment"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read attachment"));
    reader.readAsDataURL(file);
  });

const AvatarCircle = ({ avatarUrl, name }: { avatarUrl?: string | null; name: string }) => {
  const [broken, setBroken] = useState(false);
  const src = resolveMediaUrl(avatarUrl);

  return (
    <span className="message-avatar-circle" aria-hidden="true">
      {src && !broken ? (
        <img src={src} alt={`${name} avatar`} onError={() => setBroken(true)} />
      ) : (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.2 3.6-7 8-7s8 2.8 8 7" />
        </svg>
      )}
    </span>
  );
};

const MessagesWorkspace = ({ mode = "all", selectedOrderId }: MessagesWorkspaceProps) => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(0);
  const [buyerOrders, setBuyerOrders] = useState<OrderRecord[]>([]);
  const [sellerOrders, setSellerOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [messagesByOrder, setMessagesByOrder] = useState<Record<number, OrderMessage[]>>({});
  const [loadingMessagesOrderId, setLoadingMessagesOrderId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [buyerQuery, setBuyerQuery] = useState("");
  const [sellerQuery, setSellerQuery] = useState("");
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
        setBuyerOrders(buyerData);
        setSellerOrders(sellerData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filterOrders = (orders: OrderRecord[], query: string, side: "buyer" | "seller") => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return orders;
    }

    return orders.filter((order) => {
      const counterpartyName = side === "buyer" ? order.seller.name : order.buyer.name;

      return (
        String(order.id).includes(normalized) ||
        order.service.title.toLowerCase().includes(normalized) ||
        counterpartyName.toLowerCase().includes(normalized)
      );
    });
  };

  const filteredBuyerOrders = useMemo(
    () => filterOrders(buyerOrders, buyerQuery, "buyer"),
    [buyerOrders, buyerQuery]
  );
  const filteredSellerOrders = useMemo(
    () => filterOrders(sellerOrders, sellerQuery, "seller"),
    [sellerOrders, sellerQuery]
  );

  const activeOrders =
    mode === "buyer" ? filteredBuyerOrders : mode === "seller" ? filteredSellerOrders : [];

  const getThreadRoute = (side: "buyer" | "seller", orderId: number) =>
    `/dashboard/messages/${side}/${orderId}`;

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) {
      return null;
    }

    const source =
      mode === "buyer"
        ? filteredBuyerOrders
        : mode === "seller"
          ? filteredSellerOrders
          : [...filteredBuyerOrders, ...filteredSellerOrders];

    return source.find((order) => String(order.id) === selectedOrderId) ?? null;
  }, [filteredBuyerOrders, filteredSellerOrders, mode, selectedOrderId]);

  useEffect(() => {
    if (mode === "all" || selectedOrderId || activeOrders.length === 0) {
      return;
    }

    navigate(getThreadRoute(mode, activeOrders[0].id), { replace: true });
  }, [activeOrders, mode, navigate, selectedOrderId]);

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
          setError(err instanceof Error ? err.message : "Failed to load messages");
        }
      } finally {
        if (!cancelled) {
          setLoadingMessagesOrderId(null);
        }
      }
    };

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [messagesByOrder, selectedOrder]);

  const handleSend = async () => {
    if (!selectedOrder) {
      return;
    }

    const content = draft.trim();
    if (!content && pendingAttachments.length === 0) {
      return;
    }

    try {
      setSending(true);
      setError("");
      const attachmentPayload = await Promise.all(
        pendingAttachments.map(async ({ file }) => ({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          dataBase64: await fileToBase64(file),
        }))
      );

      const message = await sendOrderMessage(selectedOrder.id, {
        content,
        attachments: attachmentPayload,
      });
      setMessagesByOrder((current) => ({
        ...current,
        [selectedOrder.id]: [...(current[selectedOrder.id] ?? []), message],
      }));
      setDraft("");
      setPendingAttachments([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
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

    setError(oversizeFound ? "One or more files were skipped because they exceed 10 MB." : "");
    event.target.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setPendingAttachments((current) => current.filter((item) => item.id !== id));
  };

  const renderConversationList = (orders: OrderRecord[], side: "buyer" | "seller", query: string, setQuery: (value: string) => void) => (
    <section className="messages-list-panel">
      <div className="overview-market-head">
        <h3>{side === "buyer" ? "Buyer Conversations" : "Seller Conversations"}</h3>
        <p>{side === "buyer" ? "Chats linked to orders you placed." : "Chats linked to orders on your services."}</p>
      </div>

      <input
        className="manage-search"
        placeholder="Search by order, service, or name"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="messages-list">
        {orders.length === 0 ? (
          <div className="dashboard-placeholder compact-placeholder">
            <h2>No chats yet</h2>
            <p>{side === "buyer" ? "Buyer conversations will appear once you place orders." : "Seller conversations will appear once buyers order your services."}</p>
          </div>
        ) : (
          orders.map((order) => {
            const counterparty = side === "buyer" ? order.seller : order.buyer;
            return (
              <NavLink
                key={`${side}-${order.id}`}
                to={getThreadRoute(side, order.id)}
                className={({ isActive }) => `message-thread-btn ${isActive ? "active" : ""}`}
              >
                <div className="message-thread-inner">
                  <AvatarCircle name={counterparty.name} avatarUrl={counterparty.avatarUrl} />
                  <div className="message-thread-content">
                    <strong>{counterparty.name}</strong>
                    <span>{order.service.title}</span>
                    <small>Order #{order.id}</small>
                  </div>
                </div>
              </NavLink>
            );
          })
        )}
      </div>
    </section>
  );

  if (loading) {
    return <div className="dashboard-placeholder">Loading conversations...</div>;
  }

  if (error && buyerOrders.length === 0 && sellerOrders.length === 0) {
    return (
      <div className="dashboard-placeholder">
        <h2>Could not load conversations</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="reviews-shell">
      <section className="reviews-hero-card reviews-center-hero">
        <div>
          <p className="overview-kicker">Inbox</p>
          <h2>{mode === "buyer" ? "Buyer Inbox" : mode === "seller" ? "Seller Inbox" : "Inbox Hub"}</h2>
          <p>
            {mode === "buyer"
              ? "Keep buyer-side order conversations separate so purchases and seller communication stay easier to follow."
              : mode === "seller"
                ? "Manage seller-side order conversations in one cleaner inbox built around incoming work."
                : "Split buyer chats and seller chats into separate inbox areas so communication stays cleaner as order volume grows."}
          </p>
        </div>
        <div className="reviews-summary-grid">
          <article>
            <strong>{buyerOrders.length}</strong>
            <span>Buyer Chats</span>
          </article>
          <article>
            <strong>{sellerOrders.length}</strong>
            <span>Seller Chats</span>
          </article>
        </div>
        <div className="orders-role-switcher reviews-route-switcher">
          <NavLink to="/dashboard/messages" end className={({ isActive }) => `orders-role-tab ${isActive ? "active" : ""}`}>
            <span>Overview</span>
            <strong>Inbox Hub</strong>
          </NavLink>
          <NavLink to="/dashboard/messages/buyer" className={({ isActive }) => `orders-role-tab ${isActive ? "active" : ""}`}>
            <span>Buying</span>
            <strong>Buyer Inbox</strong>
          </NavLink>
          <NavLink to="/dashboard/messages/seller" className={({ isActive }) => `orders-role-tab ${isActive ? "active" : ""}`}>
            <span>Selling</span>
            <strong>Seller Inbox</strong>
          </NavLink>
        </div>
      </section>

      {mode === "all" && (
        <section className="orders-overview-grid">
          <article className="orders-overview-card orders-overview-card-buyer">
            <div className="orders-overview-head">
              <div>
                <p className="overview-kicker">Buyer Inbox</p>
                <h3>Chats from orders you placed</h3>
                <p>Buyer-side conversations stay separate from seller work so your purchase communication is easier to scan.</p>
              </div>
            </div>
            <div className="orders-overview-stats">
              <article><strong>{buyerOrders.length}</strong><span>Total Chats</span></article>
              <article><strong>{buyerOrders.filter((order) => order.status === "PENDING").length}</strong><span>Pending</span></article>
              <article><strong>{buyerOrders.filter((order) => order.status === "IN_PROGRESS").length}</strong><span>In Progress</span></article>
              <article><strong>{buyerOrders.filter((order) => order.status === "COMPLETED").length}</strong><span>Completed</span></article>
            </div>
          </article>

          <article className="orders-overview-card orders-overview-card-seller">
            <div className="orders-overview-head">
              <div>
                <p className="overview-kicker">Seller Inbox</p>
                <h3>Chats from incoming work</h3>
                <p>Seller-side conversations stay focused on service delivery, updates, and buyer communication for your listings.</p>
              </div>
            </div>
            <div className="orders-overview-stats">
              <article><strong>{sellerOrders.length}</strong><span>Total Chats</span></article>
              <article><strong>{sellerOrders.filter((order) => order.status === "PENDING").length}</strong><span>Pending</span></article>
              <article><strong>{sellerOrders.filter((order) => order.status === "IN_PROGRESS").length}</strong><span>In Progress</span></article>
              <article><strong>{sellerOrders.filter((order) => order.status === "COMPLETED").length}</strong><span>Completed</span></article>
            </div>
          </article>
        </section>
      )}

      {(mode === "buyer" || mode === "seller") && (
        <section className="messages-shell">
          {mode === "buyer"
            ? renderConversationList(filteredBuyerOrders, "buyer", buyerQuery, setBuyerQuery)
            : renderConversationList(filteredSellerOrders, "seller", sellerQuery, setSellerQuery)}

          <div className="messages-chat-panel">
            {selectedOrder ? (
              <>
                <div className="messages-chat-head">
                  <h3>{selectedOrder.service.title}</h3>
                  <p>
                    Order #{selectedOrder.id} | Status: {statusLabel(selectedOrder.status)}
                  </p>
                  <p className="service-seller">
                    Buyer:{" "}
                    <Link to={`/profile/${selectedOrder.buyer.id}`} className="profile-inline-link">
                      <strong>{selectedOrder.buyer.name}</strong>
                    </Link>{" "}
                    | Seller:{" "}
                    <Link to={`/profile/${selectedOrder.seller.id}`} className="profile-inline-link">
                      <strong>{selectedOrder.seller.name}</strong>
                    </Link>
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
                        className={`message-chat-row ${message.senderId === currentUserId ? "outgoing" : "incoming"}`}
                      >
                        <AvatarCircle name={message.sender.name} avatarUrl={message.sender.avatarUrl} />

                        <div className={`order-chat-item ${message.senderId === currentUserId ? "outgoing" : "incoming"}`}>
                          <Link to={`/profile/${message.sender.id}`} className="profile-inline-link">
                            <strong>{message.sender.name}</strong>
                          </Link>
                          {message.content && <p className="message-content-pre">{message.content}</p>}

                          {(message.attachments ?? []).length > 0 && (
                            <div className="sent-attachment-grid">
                              {(message.attachments ?? []).map((attachment) => (
                                <a
                                  key={attachment.id}
                                  href={resolveMediaUrl(attachment.fileUrl) ?? attachment.fileUrl}
                                  className="sent-attachment-card"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <strong>{attachment.fileName}</strong>
                                  <span>{formatBytes(attachment.size)}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
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
                  <button type="button" className="btn-primary" onClick={handleSend} disabled={sending}>
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
                  Uploaded files are attached to this message and can be downloaded by both parties.
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
      )}
    </div>
  );
};

export default MessagesWorkspace;
