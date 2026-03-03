import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
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

    load();
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

  const handleToggleMessages = async (orderId: number) => {
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
      const message = await sendOrderMessage(orderId, draft);
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

  const renderOrderCard = (order: OrderRecord, role: "buyer" | "seller") => {
    const actions = role === "seller" ? getSellerActions(order.status) : getBuyerActions(order.status);
    const messages = messagesByOrder[order.id] ?? [];
    const isExpanded = expandedOrderId === order.id;

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
          Buyer: <strong>{order.buyer.name}</strong>
        </p>
        <p className="service-seller">
          Seller: <strong>{order.seller.name}</strong>
        </p>

        {order.requirements && (
          <p className="order-requirements">Requirements: {order.requirements}</p>
        )}

        <div className="service-footer">
          <span>Order Amount</span>
          <strong>{formatPrice(order.amount)}</strong>
        </div>

        <div className="manage-actions-row">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="btn-outline"
              disabled={busyOrderId === order.id}
              onClick={() => handleStatusAction(order.id, action.nextStatus)}
            >
              {busyOrderId === order.id ? "Updating..." : action.label}
            </button>
          ))}

          <button
            type="button"
            className="btn-outline"
            onClick={() => handleToggleMessages(order.id)}
          >
            {isExpanded ? "Hide Messages" : "Messages"}
          </button>

          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate(`/dashboard/messages/${order.id}`)}
          >
            Open Chat Page
          </button>
        </div>

        {isExpanded && (
          <div className="order-chat-box">
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
      <div className="orders-header-row">
        <div>
          <h2>Orders Workspace</h2>
          <p>Manage buyer and seller pipelines with order-linked messaging.</p>
        </div>

        <div className="manage-actions-row">
          <button type="button" className="btn-outline" onClick={() => navigate("/dashboard")}>Back to Dashboard Home</button>
        </div>
      </div>

      <div className="manage-filter-group orders-route-tabs">
        <NavLink to="/dashboard/orders" end className={({ isActive }) => `manage-filter-btn ${isActive ? "active" : ""}`}>
          All Orders
        </NavLink>
        <NavLink to="/dashboard/orders/buyer" className={({ isActive }) => `manage-filter-btn ${isActive ? "active" : ""}`}>
          Buyer Orders
        </NavLink>
        <NavLink to="/dashboard/orders/seller" className={({ isActive }) => `manage-filter-btn ${isActive ? "active" : ""}`}>
          Seller Orders
        </NavLink>
      </div>

      {actionError && <p className="form-status form-status-error">{actionError}</p>}

      {(mode === "all" || mode === "buyer") &&
        renderSection({
          title: "Buyer Dashboard",
          subtitle: "Orders you placed in the marketplace.",
          orders: buyerOrders,
          filtered: filteredBuyerOrders,
          role: "buyer",
          filter: buyerFilter,
          setFilter: setBuyerFilter,
          query: buyerQuery,
          setQuery: setBuyerQuery,
        })}

      {(mode === "all" || mode === "seller") &&
        renderSection({
          title: "Seller Dashboard",
          subtitle: "Incoming orders on your own services.",
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
