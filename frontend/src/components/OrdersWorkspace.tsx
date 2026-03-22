import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  createReview,
  fetchBuyerOrders,
  fetchOrderMessages,
  fetchSellerOrders,
  getCurrentUser,
  sendOrderMessage,
  updateOrderStatus,
} from "../utils/api";
import type { OrderMessage, OrderStatus } from "../utils/api";

type OrdersMode = "all" | "buyer" | "seller";

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
  review?: {
    id: number;
    rating: number;
    comment: string | null;
    reviewerId: number;
    revieweeId: number;
    createdAt: string;
  } | null;
};

type OrdersFilter = "ALL" | OrderStatus;

const statusOptions: OrdersFilter[] = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (amount: number) => `\u20B9${amount}`;
const countByStatus = (orders: OrderRecord[], status: OrderStatus) =>
  orders.filter((order) => order.status === status).length;
const statusLabel = (status: string) => status.replaceAll("_", " ");
const statusClass = (status: OrderStatus) => status.toLowerCase();
const renderStars = (rating: number) => "?".repeat(rating) + "?".repeat(5 - rating);
const isActionableOrder = (status: OrderStatus) =>
  status === "PENDING" ||
  status === "ACCEPTED" ||
  status === "IN_PROGRESS" ||
  status === "DELIVERED";

const getSellerActions = (status: OrderStatus) => {
  if (status === "PENDING") {
    return [
      { label: "Accept", nextStatus: "ACCEPTED" as OrderStatus },
      { label: "Reject", nextStatus: "CANCELLED" as OrderStatus },
    ];
  }

  if (status === "ACCEPTED") {
    return [
      { label: "Start Work", nextStatus: "IN_PROGRESS" as OrderStatus },
      { label: "Cancel", nextStatus: "CANCELLED" as OrderStatus },
    ];
  }

  if (status === "IN_PROGRESS") {
    return [
      { label: "Mark Delivered", nextStatus: "DELIVERED" as OrderStatus },
      { label: "Cancel", nextStatus: "CANCELLED" as OrderStatus },
    ];
  }

  return [];
};

const getBuyerActions = (status: OrderStatus) => {
  if (status === "DELIVERED") {
    return [{ label: "Mark Completed", nextStatus: "COMPLETED" as OrderStatus }];
  }

  if (status === "PENDING" || status === "ACCEPTED" || status === "IN_PROGRESS") {
    return [{ label: "Cancel", nextStatus: "CANCELLED" as OrderStatus }];
  }

  return [];
};

const filterOrders = (orders: OrderRecord[], filter: OrdersFilter, query: string) => {
  const normalized = query.trim().toLowerCase();

  return orders.filter((order) => {
    const statusMatch = filter === "ALL" || order.status === filter;
    const queryMatch =
      normalized.length === 0 ||
      order.service.title.toLowerCase().includes(normalized) ||
      order.service.category.toLowerCase().includes(normalized) ||
      String(order.id).includes(normalized);

    return statusMatch && queryMatch;
  });
};

const OrdersWorkspace = ({ mode }: { mode: OrdersMode }) => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(0);

  const [buyerOrders, setBuyerOrders] = useState<OrderRecord[]>([]);
  const [sellerOrders, setSellerOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [buyerFilter, setBuyerFilter] = useState<OrdersFilter>("ALL");
  const [sellerFilter, setSellerFilter] = useState<OrdersFilter>("ALL");
  const [buyerQuery, setBuyerQuery] = useState("");
  const [sellerQuery, setSellerQuery] = useState("");

  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [messagesByOrder, setMessagesByOrder] = useState<Record<number, OrderMessage[]>>({});
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [loadingMessagesOrderId, setLoadingMessagesOrderId] = useState<number | null>(null);
  const [sendingMessageOrderId, setSendingMessageOrderId] = useState<number | null>(null);
  const [draftByOrder, setDraftByOrder] = useState<Record<number, string>>({});
  const [reviewFormOrderId, setReviewFormOrderId] = useState<number | null>(null);
  const [reviewRatingByOrder, setReviewRatingByOrder] = useState<Record<number, number>>({});
  const [reviewCommentByOrder, setReviewCommentByOrder] = useState<Record<number, string>>({});
  const [submittingReviewOrderId, setSubmittingReviewOrderId] = useState<number | null>(null);

  const filteredBuyerOrders = useMemo(
    () => filterOrders(buyerOrders, buyerFilter, buyerQuery),
    [buyerOrders, buyerFilter, buyerQuery]
  );
  const filteredSellerOrders = useMemo(
    () => filterOrders(sellerOrders, sellerFilter, sellerQuery),
    [sellerOrders, sellerFilter, sellerQuery]
  );

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
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load orders");
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleStatusAction = async (orderId: number, nextStatus: OrderStatus) => {
    try {
      setBusyOrderId(orderId);
      setActionError("");
      const updated = await updateOrderStatus(orderId, nextStatus);

      setBuyerOrders((current) =>
        current.map((order) => (order.id === orderId ? updated : order))
      );
      setSellerOrders((current) =>
        current.map((order) => (order.id === orderId ? updated : order))
      );
    } catch (err) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to update order status");
      }
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleToggleDetails = async (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(orderId);

    if (!messagesByOrder[orderId]) {
      try {
        setLoadingMessagesOrderId(orderId);
        const data = await fetchOrderMessages(orderId);
        setMessagesByOrder((current) => ({ ...current, [orderId]: data }));
      } catch (err) {
        if (err instanceof Error) {
          setActionError(err.message);
        } else {
          setActionError("Failed to load messages");
        }
      } finally {
        setLoadingMessagesOrderId(null);
      }
    }
  };

  const handleSendMessage = async (orderId: number) => {
    const draft = draftByOrder[orderId]?.trim();
    if (!draft) {
      return;
    }

    try {
      setSendingMessageOrderId(orderId);
      setActionError("");
      const message = await sendOrderMessage(orderId, { content: draft });
      setMessagesByOrder((current) => ({
        ...current,
        [orderId]: [...(current[orderId] ?? []), message],
      }));
      setDraftByOrder((current) => ({ ...current, [orderId]: "" }));
    } catch (err) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to send message");
      }
    } finally {
      setSendingMessageOrderId(null);
    }
  };

  const handleSubmitReview = async (order: OrderRecord) => {
    const rating = reviewRatingByOrder[order.id];
    const comment = reviewCommentByOrder[order.id]?.trim();

    if (!rating || rating < 1 || rating > 5) {
      setActionError("Please select a rating between 1 and 5.");
      return;
    }

    try {
      setSubmittingReviewOrderId(order.id);
      setActionError("");

      const review = await createReview({
        orderId: order.id,
        rating,
        comment: comment || undefined,
      });

      const nextReview = {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        reviewerId: review.reviewerId,
        revieweeId: review.revieweeId,
        createdAt: review.createdAt,
      };

      setBuyerOrders((current) =>
        current.map((item) => (item.id === order.id ? { ...item, review: nextReview } : item))
      );
      setSellerOrders((current) =>
        current.map((item) => (item.id === order.id ? { ...item, review: nextReview } : item))
      );

      setReviewFormOrderId(null);
      setReviewRatingByOrder((current) => ({ ...current, [order.id]: 0 }));
      setReviewCommentByOrder((current) => ({ ...current, [order.id]: "" }));
    } catch (err) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to submit review");
      }
    } finally {
      setSubmittingReviewOrderId(null);
    }
  };

  const renderOrderCard = (order: OrderRecord, role: "buyer" | "seller") => {
    const actions = role === "seller" ? getSellerActions(order.status) : getBuyerActions(order.status);
    const primaryAction = actions[0];
    const secondaryAction = actions[1];
    const messages = messagesByOrder[order.id] ?? [];
    const isExpanded = expandedOrderId === order.id;
    const canReview = role === "buyer" && order.status === "COMPLETED" && !order.review;
    const isReviewing = reviewFormOrderId === order.id;

    const messageRoute =
      role === "buyer"
        ? `/dashboard/messages/buyer/${order.id}`
        : `/dashboard/messages/seller/${order.id}`;

    return (
      <article key={`${role}-${order.id}`} className="order-card refined-order-card">
        <div className="order-card-head">
          <span className={`order-status-chip ${statusClass(order.status)}`}>
            {statusLabel(order.status)}
          </span>
          <span className="manage-date-chip">Order #{order.id}</span>
        </div>

        <h3>{order.service.title}</h3>
        <p className="service-category">{order.service.category}</p>
        <p className="service-seller">Placed on {formatDate(order.createdAt)}</p>
        <p className="service-seller">
          Buyer:{" "}
          <Link to={`/profile/${order.buyer.id}`} className="profile-inline-link">
            <strong>{order.buyer.name}</strong>
          </Link>
        </p>
        <p className="service-seller">
          Seller:{" "}
          <Link to={`/profile/${order.seller.id}`} className="profile-inline-link">
            <strong>{order.seller.name}</strong>
          </Link>
        </p>

        <div className="order-meta-strip">
          <div>
            <span>Order Amount</span>
            <strong>{formatPrice(order.amount)}</strong>
          </div>
          <div>
            <span>Current Stage</span>
            <strong>{statusLabel(order.status)}</strong>
          </div>
        </div>

        <div className="order-primary-actions">
          {primaryAction ? (
            <button
              type="button"
              className="btn-primary"
              disabled={busyOrderId === order.id}
              onClick={() => handleStatusAction(order.id, primaryAction.nextStatus)}
            >
              {busyOrderId === order.id ? "Updating..." : primaryAction.label}
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(messageRoute)}
            >
              Open Chat
            </button>
          )}

          {primaryAction && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate(messageRoute)}
            >
              Open Chat
            </button>
          )}
        </div>

        <div className="order-secondary-actions">
          {secondaryAction && (
            <button
              type="button"
              className="btn-outline danger-button"
              disabled={busyOrderId === order.id}
              onClick={() => handleStatusAction(order.id, secondaryAction.nextStatus)}
            >
              {busyOrderId === order.id ? "Updating..." : secondaryAction.label}
            </button>
          )}

          {canReview && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setReviewFormOrderId((current) => (current === order.id ? null : order.id));
                setReviewRatingByOrder((current) => ({
                  ...current,
                  [order.id]: current[order.id] ?? 5,
                }));
                if (!isExpanded) {
                  void handleToggleDetails(order.id);
                }
              }}
            >
              {isReviewing ? "Close Review" : "Leave Review"}
            </button>
          )}

          <button
            type="button"
            className="btn-outline"
            onClick={() => handleToggleDetails(order.id)}
          >
            {isExpanded ? "Hide Details" : "View Details"}
          </button>
        </div>

        {order.review && (
          <div className="order-review-summary">
            <strong>Review Submitted</strong>
            <p>{renderStars(order.review.rating)}</p>
            {order.review.comment && <span>{order.review.comment}</span>}
          </div>
        )}

        {isExpanded && (
          <div className="order-details-panel">
            {order.requirements && (
              <div className="order-details-block">
                <strong>Requirements</strong>
                <p className="order-requirements">{order.requirements}</p>
              </div>
            )}

            {isActionableOrder(order.status) && (
              <div className="order-details-block">
                <strong>{role === "seller" ? "Seller Workflow" : "Buyer Workflow"}</strong>
                <p className="service-seller">
                  {role === "seller"
                    ? "Use this order thread to accept, deliver, or update progress while keeping communication tied to the order."
                    : "Track the order stage here, message the seller, and complete the order once delivery meets your requirements."}
                </p>
              </div>
            )}

            <div className="order-chat-box">
              <div className="order-details-block order-details-heading">
                <strong>Quick Messages</strong>
              </div>

              {loadingMessagesOrderId === order.id ? (
                <p className="service-seller">Loading messages...</p>
              ) : (
                <div className="order-chat-list">
                  {messages.length === 0 ? (
                    <p className="service-seller">No messages yet for this order.</p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`order-chat-item ${
                          message.senderId === currentUserId ? "outgoing" : "incoming"
                        }`}
                      >
                        <strong>{message.sender.name}</strong>
                        <p>{message.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="order-chat-compose">
                <input
                  placeholder={`Message ${role === "seller" ? "buyer" : "seller"}...`}
                  value={draftByOrder[order.id] ?? ""}
                  onChange={(event) =>
                    setDraftByOrder((current) => ({
                      ...current,
                      [order.id]: event.target.value,
                    }))
                  }
                />
                <button
                  type="button"
                  className="btn-primary"
                  disabled={sendingMessageOrderId === order.id}
                  onClick={() => handleSendMessage(order.id)}
                >
                  {sendingMessageOrderId === order.id ? "Sending..." : "Send"}
                </button>
              </div>
            </div>

            {isReviewing && canReview && (
              <div className="order-review-form">
                <label className="create-field">
                  <span>Rating</span>
                  <select
                    value={reviewRatingByOrder[order.id] ?? 5}
                    onChange={(event) =>
                      setReviewRatingByOrder((current) => ({
                        ...current,
                        [order.id]: Number(event.target.value),
                      }))
                    }
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={3}>3 - Good</option>
                    <option value={2}>2 - Fair</option>
                    <option value={1}>1 - Poor</option>
                  </select>
                </label>

                <label className="create-field">
                  <span>Comment (Optional)</span>
                  <textarea
                    rows={3}
                    placeholder="Share your experience with this seller..."
                    value={reviewCommentByOrder[order.id] ?? ""}
                    onChange={(event) =>
                      setReviewCommentByOrder((current) => ({
                        ...current,
                        [order.id]: event.target.value,
                      }))
                    }
                  />
                </label>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleSubmitReview(order)}
                  disabled={submittingReviewOrderId === order.id}
                >
                  {submittingReviewOrderId === order.id ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            )}
          </div>
        )}
      </article>
    );
  };

  const renderSection = ({
    title,
    subtitle,
    orders,
    filtered,
    role,
    filter,
    setFilter,
    query,
    setQuery,
  }: {
    title: string;
    subtitle: string;
    orders: OrderRecord[];
    filtered: OrderRecord[];
    role: "buyer" | "seller";
    filter: OrdersFilter;
    setFilter: (value: OrdersFilter) => void;
    query: string;
    setQuery: (value: string) => void;
  }) => (
    <section className="orders-section-card">
      <div className="orders-section-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        <div className="orders-count-grid">
          <article>
            <strong>{orders.length}</strong>
            <span>Total</span>
          </article>
          <article>
            <strong>{countByStatus(orders, "PENDING")}</strong>
            <span>Pending</span>
          </article>
          <article>
            <strong>{countByStatus(orders, "IN_PROGRESS")}</strong>
            <span>In Progress</span>
          </article>
          <article>
            <strong>{countByStatus(orders, "COMPLETED")}</strong>
            <span>Completed</span>
          </article>
        </div>
      </div>

      <div className="orders-toolbar">
        <input
          className="manage-search"
          placeholder="Search by order id, service title, category"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="manage-filter-group">
          {statusOptions.map((option) => (
            <button
              key={`${title}-${option}`}
              type="button"
              className={`manage-filter-btn ${filter === option ? "active" : ""}`}
              onClick={() => setFilter(option)}
            >
              {statusLabel(option)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="dashboard-placeholder compact-placeholder">
          <h2>No orders found</h2>
          <p>Try another filter or search term.</p>
        </div>
      ) : (
        <div className="orders-grid split-orders-grid">
          {filtered.map((order) => renderOrderCard(order, role))}
        </div>
      )}
    </section>
  );

  const buyerSummary = {
    total: buyerOrders.length,
    active: buyerOrders.filter((order) => isActionableOrder(order.status)).length,
    pending: countByStatus(buyerOrders, "PENDING"),
    completed: countByStatus(buyerOrders, "COMPLETED"),
  };

  const sellerSummary = {
    total: sellerOrders.length,
    active: sellerOrders.filter((order) => isActionableOrder(order.status)).length,
    pending: countByStatus(sellerOrders, "PENDING"),
    completed: countByStatus(sellerOrders, "COMPLETED"),
  };

  if (loading) {
    return <div className="dashboard-placeholder">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-placeholder">
        <h2>Could not load orders</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="orders-shell">
      <section className="orders-hero-card">
        <div className="orders-header-row">
          <div>
            <p className="overview-kicker">Order Center</p>
            <h2>{mode === "buyer" ? "Buyer Orders" : mode === "seller" ? "Seller Orders" : "Orders Hub"}</h2>
            <p>
              {mode === "buyer"
                ? "Manage the orders you placed with a focused buyer view that feels clearer and easier to follow."
                : mode === "seller"
                  ? "Handle incoming work with a dedicated seller pipeline built around fulfillment and order actions."
                  : "Pick the side of the marketplace you want to manage. Buyer and seller activity now live in separate workspaces to keep the flow cleaner."}
            </p>
          </div>

        </div>

        <div className="orders-role-switcher">
          <NavLink to="/dashboard/orders" end className={({ isActive }) => `orders-role-tab ${isActive ? "active" : ""}`}>
            <span>Overview</span>
            <strong>Orders Hub</strong>
          </NavLink>
          <NavLink to="/dashboard/orders/buyer" className={({ isActive }) => `orders-role-tab ${isActive ? "active" : ""}`}>
            <span>Buying</span>
            <strong>Buyer Orders</strong>
          </NavLink>
          <NavLink to="/dashboard/orders/seller" className={({ isActive }) => `orders-role-tab ${isActive ? "active" : ""}`}>
            <span>Selling</span>
            <strong>Seller Orders</strong>
          </NavLink>
        </div>
      </section>

      {actionError && <p className="form-status form-status-error">{actionError}</p>}

      {mode === "all" && (
        <section className="orders-overview-grid">
          <article className="orders-overview-card orders-overview-card-buyer">
            <div className="orders-overview-head">
              <div>
                <p className="overview-kicker">Buyer Workspace</p>
                <h3>Orders you placed</h3>
                <p>Track purchases, message sellers, and complete deliveries from a cleaner buyer-only area.</p>
              </div>
            </div>

            <div className="orders-overview-stats">
              <article><strong>{buyerSummary.total}</strong><span>Total Orders</span></article>
              <article><strong>{buyerSummary.active}</strong><span>Active Pipeline</span></article>
              <article><strong>{buyerSummary.pending}</strong><span>Pending</span></article>
              <article><strong>{buyerSummary.completed}</strong><span>Completed</span></article>
            </div>
          </article>

          <article className="orders-overview-card orders-overview-card-seller">
            <div className="orders-overview-head">
              <div>
                <p className="overview-kicker">Seller Workspace</p>
                <h3>Orders on your services</h3>
                <p>Handle inbound work, move orders through each stage, and keep seller operations easier to scan.</p>
              </div>
            </div>

            <div className="orders-overview-stats">
              <article><strong>{sellerSummary.total}</strong><span>Total Orders</span></article>
              <article><strong>{sellerSummary.active}</strong><span>Active Pipeline</span></article>
              <article><strong>{sellerSummary.pending}</strong><span>Awaiting Response</span></article>
              <article><strong>{sellerSummary.completed}</strong><span>Completed</span></article>
            </div>
          </article>
        </section>
      )}

      {mode === "buyer" &&
        renderSection({
          title: "Buyer Orders",
          subtitle: "Orders you placed in the marketplace, with buyer-focused actions and cleaner tracking.",
          orders: buyerOrders,
          filtered: filteredBuyerOrders,
          role: "buyer",
          filter: buyerFilter,
          setFilter: setBuyerFilter,
          query: buyerQuery,
          setQuery: setBuyerQuery,
        })}

      {mode === "seller" &&
        renderSection({
          title: "Seller Orders",
          subtitle: "Incoming orders on your own services, organized around delivery and fulfillment.",
          orders: sellerOrders,
          filtered: filteredSellerOrders,
          role: "seller",
          filter: sellerFilter,
          setFilter: setSellerFilter,
          query: sellerQuery,
          setQuery: setSellerQuery,
        })}
    </div>
  );
};

export default OrdersWorkspace;
