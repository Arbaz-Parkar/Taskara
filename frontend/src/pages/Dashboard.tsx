import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  deleteMyService,
  fetchBuyerOrders,
  fetchMyServices,
  fetchOrderMessages,
  fetchSellerOrders,
  getCurrentUser,
  sendOrderMessage,
  updateMyService,
  updateMyServiceStatus,
  updateOrderStatus as updateOrderStatusApi,
} from "../utils/api";
import type { OrderMessage, OrderStatus } from "../utils/api";
import { logout } from "../utils/auth";
import logo from "../assets/logo.png";

import Marketplace from "./Marketplace";
import CreateService from "./CreateService.tsx";

type User = {
  userId: number;
  name?: string;
  email: string;
};

type Service = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  seller: {
    name: string;
  };
};

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

type View =
  | "overview"
  | "create"
  | "services"
  | "orders"
  | "messages"
  | "settings";

type NavItem = {
  key: View;
  label: string;
};

type ServiceEditForm = {
  title: string;
  category: string;
  price: string;
  description: string;
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

const navItems: NavItem[] = [
  { key: "overview", label: "Dashboard" },
  { key: "create", label: "Create Service" },
  { key: "services", label: "My Listings" },
  { key: "orders", label: "Orders" },
  { key: "messages", label: "Inbox" },
  { key: "settings", label: "Settings" },
];

const SidebarIcon = ({ view }: { view: View }) => {
  if (view === "overview") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M6 10v9h12v-9" />
      </svg>
    );
  }

  if (view === "create") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
        <rect x="3" y="3" width="18" height="18" rx="4" />
      </svg>
    );
  }

  if (view === "services") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="7" height="7" rx="2" />
        <rect x="13" y="4" width="7" height="7" rx="2" />
        <rect x="4" y="13" width="7" height="7" rx="2" />
        <rect x="13" y="13" width="7" height="7" rx="2" />
      </svg>
    );
  }

  if (view === "orders") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="3" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    );
  }

  if (view === "messages") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v10H8l-4 4V6Z" />
        <path d="M8 10h8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v2" />
      <path d="M12 18v2" />
      <path d="M4 12h2" />
      <path d="M18 12h2" />
      <path d="m6.3 6.3 1.4 1.4" />
      <path d="m16.3 16.3 1.4 1.4" />
      <path d="m6.3 17.7 1.4-1.4" />
      <path d="m16.3 7.7 1.4-1.4" />
    </svg>
  );
};

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

const MyServicesManagement = ({
  loading,
  services,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
}: {
  loading: boolean;
  services: Service[];
  error: string;
  onCreate: () => void;
  onUpdate: (serviceId: number, payload: ServiceEditForm) => Promise<void>;
  onDelete: (serviceId: number) => Promise<void>;
  onToggleStatus: (serviceId: number, isActive: boolean) => Promise<void>;
}) => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ServiceEditForm>({
    title: "",
    category: "",
    price: "",
    description: "",
  });
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [busyServiceId, setBusyServiceId] = useState<number | null>(null);

  const filteredServices = useMemo(() => {
    const search = query.trim().toLowerCase();

    return services.filter((service) => {
      const matchesFilter =
        statusFilter === "all" ||
        (statusFilter === "active" && service.isActive) ||
        (statusFilter === "paused" && !service.isActive);

      const matchesSearch =
        search.length === 0 ||
        service.title.toLowerCase().includes(search) ||
        service.category.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [query, services, statusFilter]);

  const startEdit = (service: Service) => {
    setEditingServiceId(service.id);
    setActionError("");
    setActionSuccess("");
    setEditForm({
      title: service.title,
      category: service.category,
      price: String(service.price),
      description: service.description,
    });
  };

  const cancelEdit = () => {
    setEditingServiceId(null);
    setActionError("");
  };

  const submitEdit = async (serviceId: number) => {
    try {
      setBusyServiceId(serviceId);
      setActionError("");
      setActionSuccess("");
      await onUpdate(serviceId, editForm);
      setActionSuccess("Service updated.");
      setEditingServiceId(null);
    } catch (err) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to update service");
      }
    } finally {
      setBusyServiceId(null);
    }
  };

  const handleToggleStatus = async (serviceId: number, currentStatus: boolean) => {
    try {
      setBusyServiceId(serviceId);
      setActionError("");
      setActionSuccess("");
      await onToggleStatus(serviceId, !currentStatus);
      setActionSuccess(currentStatus ? "Service paused." : "Service reactivated.");
    } catch (err) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to update service status");
      }
    } finally {
      setBusyServiceId(null);
    }
  };

  const handleDelete = async (serviceId: number, title: string) => {
    const confirmed = window.confirm(`Delete "${title}" permanently?`);
    if (!confirmed) {
      return;
    }

    try {
      setBusyServiceId(serviceId);
      setActionError("");
      setActionSuccess("");
      await onDelete(serviceId);
      setActionSuccess("Service deleted.");
      if (editingServiceId === serviceId) {
        setEditingServiceId(null);
      }
    } catch (err) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to delete service");
      }
    } finally {
      setBusyServiceId(null);
    }
  };

  if (loading) {
    return <div className="dashboard-placeholder">Loading your listings...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-placeholder">
        <h2>Could not load your listings</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="overview-market-section">
      <div className="manage-head-row">
        <div className="overview-market-head">
          <h3>My Services Management</h3>
          <p>Edit, pause, reactivate, and delete your listings.</p>
        </div>

        <button type="button" className="btn-primary" onClick={onCreate}>
          + Create Service
        </button>
      </div>

      <div className="manage-toolbar">
        <input
          className="manage-search"
          placeholder="Search by title or category"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="manage-filter-group" role="tablist" aria-label="Service status filter">
          <button
            type="button"
            className={`manage-filter-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`manage-filter-btn ${statusFilter === "active" ? "active" : ""}`}
            onClick={() => setStatusFilter("active")}
          >
            Active
          </button>
          <button
            type="button"
            className={`manage-filter-btn ${statusFilter === "paused" ? "active" : ""}`}
            onClick={() => setStatusFilter("paused")}
          >
            Paused
          </button>
        </div>
      </div>

      {actionError && <p className="form-status form-status-error">{actionError}</p>}
      {actionSuccess && <p className="form-status form-status-success">{actionSuccess}</p>}

      {filteredServices.length === 0 ? (
        <div className="dashboard-placeholder">
          <h2>No matching listings</h2>
          <p>Try adjusting your search/filter or create a new service.</p>
        </div>
      ) : (
        <div className="manage-list-grid">
          {filteredServices.map((service) => {
            const isEditing = editingServiceId === service.id;
            const isBusy = busyServiceId === service.id;

            return (
              <article key={service.id} className="manage-service-card">
                <div className="manage-service-header">
                  <span className={`manage-status-chip ${service.isActive ? "active" : "paused"}`}>
                    {service.isActive ? "Active" : "Paused"}
                  </span>
                  <span className="manage-date-chip">Created {formatDate(service.createdAt)}</span>
                </div>

                {isEditing ? (
                  <div className="manage-edit-grid">
                    <label className="create-field">
                      <span>Title</span>
                      <input
                        value={editForm.title}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, title: event.target.value }))
                        }
                      />
                    </label>

                    <label className="create-field">
                      <span>Category</span>
                      <input
                        value={editForm.category}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, category: event.target.value }))
                        }
                      />
                    </label>

                    <label className="create-field create-price-field">
                      <span>Price</span>
                      <input
                        type="number"
                        min="1"
                        value={editForm.price}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, price: event.target.value }))
                        }
                      />
                    </label>

                    <label className="create-field">
                      <span>Description</span>
                      <textarea
                        rows={4}
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                      />
                    </label>

                    <div className="manage-actions-row">
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={isBusy}
                        onClick={() => submitEdit(service.id)}
                      >
                        {isBusy ? "Saving..." : "Save"}
                      </button>
                      <button type="button" className="btn-outline" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="service-category">{service.category}</p>
                    <h3>{service.title}</h3>
                    <p className="service-seller">{service.description}</p>

                    <div className="service-footer">
                      <span>Starting at</span>
                      <strong>{formatPrice(service.price)}</strong>
                    </div>

                    <div className="manage-actions-row">
                      <button
                        type="button"
                        className="btn-outline"
                        disabled={isBusy}
                        onClick={() => startEdit(service)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn-outline"
                        disabled={isBusy}
                        onClick={() => handleToggleStatus(service.id, service.isActive)}
                      >
                        {service.isActive ? "Pause" : "Activate"}
                      </button>

                      <button
                        type="button"
                        className="manage-delete-btn"
                        disabled={isBusy}
                        onClick={() => handleDelete(service.id, service.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

const OrdersManagement = ({
  loading,
  error,
  buyerOrders,
  sellerOrders,
  onStatusChange,
  onBack,
  currentUserId,
}: {
  loading: boolean;
  error: string;
  buyerOrders: OrderRecord[];
  sellerOrders: OrderRecord[];
  onStatusChange: (orderId: number, status: OrderStatus) => Promise<void>;
  onBack: () => void;
  currentUserId: number;
}) => {
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

  const filteredBuyerOrders = filterOrders(buyerOrders, buyerFilter, buyerQuery);
  const filteredSellerOrders = filterOrders(sellerOrders, sellerFilter, sellerQuery);

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

  const handleStatusAction = async (orderId: number, nextStatus: OrderStatus) => {
    try {
      setBusyOrderId(orderId);
      setActionError("");
      await onStatusChange(orderId, nextStatus);
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

        <button type="button" className="btn-outline" onClick={onBack}>
          Back to Dashboard Home
        </button>
      </div>

      {actionError && <p className="form-status form-status-error">{actionError}</p>}

      {renderSection({
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

      {renderSection({
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

const MessagesWorkspace = ({
  orders,
  currentUserId,
}: {
  orders: OrderRecord[];
  currentUserId: number;
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
    orders[0]?.id ?? null
  );
  const [messagesByOrder, setMessagesByOrder] = useState<Record<number, OrderMessage[]>>({});
  const [loadingMessagesOrderId, setLoadingMessagesOrderId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

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

  const selectedOrder =
    filteredOrders.find((order) => order.id === selectedOrderId) ??
    filteredOrders[0] ??
    null;

  useEffect(() => {
    if (!selectedOrder && filteredOrders.length > 0) {
      setSelectedOrderId(filteredOrders[0].id);
    }
  }, [filteredOrders, selectedOrder]);

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    if (messagesByOrder[selectedOrder.id]) {
      return;
    }

    let isCancelled = false;

    const load = async () => {
      try {
        setLoadingMessagesOrderId(selectedOrder.id);
        setError("");
        const data = await fetchOrderMessages(selectedOrder.id);
        if (!isCancelled) {
          setMessagesByOrder((current) => ({ ...current, [selectedOrder.id]: data }));
        }
      } catch (err) {
        if (!isCancelled) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Failed to load messages");
          }
        }
      } finally {
        if (!isCancelled) {
          setLoadingMessagesOrderId(null);
        }
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [selectedOrder, messagesByOrder]);

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrderId(orderId);
  };

  const handleSend = async () => {
    if (!selectedOrder) {
      return;
    }

    const content = draft.trim();
    if (!content) {
      return;
    }

    try {
      setSending(true);
      setError("");
      const message = await sendOrderMessage(selectedOrder.id, content);
      setMessagesByOrder((current) => ({
        ...current,
        [selectedOrder.id]: [...(current[selectedOrder.id] ?? []), message],
      }));
      setDraft("");
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
              <button
                key={order.id}
                type="button"
                className={`message-thread-btn ${
                  selectedOrder?.id === order.id ? "active" : ""
                }`}
                onClick={() => handleSelectOrder(order.id)}
              >
                <strong>{counterpartyName}</strong>
                <span>{order.service.title}</span>
                <small>Order #{order.id}</small>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="messages-chat-panel">
        {selectedOrder && (
          <>
            <div className="messages-chat-head">
              <h3>{selectedOrder.service.title}</h3>
              <p>
                Order #{selectedOrder.id} · Status: {statusLabel(selectedOrder.status)}
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
                    <p>{message.content}</p>
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
              <button
                type="button"
                className="btn-primary"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>

            <div className="messages-upnext-note">
              File delivery and attachments will be added in the next phase.
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const OverviewPanel = ({
  loading,
  services,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
}: {
  loading: boolean;
  services: Service[];
  error: string;
  onCreate: () => void;
  onUpdate: (serviceId: number, payload: ServiceEditForm) => Promise<void>;
  onDelete: (serviceId: number) => Promise<void>;
  onToggleStatus: (serviceId: number, isActive: boolean) => Promise<void>;
}) => {
  return (
    <div className="overview-shell">
      <section className="overview-hero-card">
        <div>
          <p className="overview-kicker">Seller Command Center</p>
          <h2>Build services, publish them, and manage them in one place.</h2>
          <p>Listings are real. Updates here directly control what buyers can see.</p>
        </div>

        <div className="overview-actions">
          <button type="button" className="btn-primary" onClick={onCreate}>
            + New Service
          </button>
        </div>
      </section>

      <MyServicesManagement
        loading={loading}
        services={services}
        error={error}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />

      <section className="overview-market-section">
        <div className="overview-market-head">
          <h3>Live Marketplace</h3>
          <p>Browse what other users are currently offering.</p>
        </div>
        <Marketplace />
      </section>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [loadingMyServices, setLoadingMyServices] = useState(true);
  const [myServicesError, setMyServicesError] = useState("");

  const [buyerOrders, setBuyerOrders] = useState<OrderRecord[]>([]);
  const [sellerOrders, setSellerOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const mergedOrders = useMemo(() => {
    const map = new Map<number, OrderRecord>();
    [...buyerOrders, ...sellerOrders].forEach((order) => {
      map.set(order.id, order);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [buyerOrders, sellerOrders]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("tab") === "orders") {
      setActiveView("orders");
    }
  }, [location.search]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch {
        logout();
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const loadMyServices = async () => {
    try {
      setLoadingMyServices(true);
      setMyServicesError("");
      const data = await fetchMyServices();
      setMyServices(data);
    } catch (err) {
      if (err instanceof Error) {
        setMyServicesError(err.message);
      } else {
        setMyServicesError("Failed to load your listings");
      }
    } finally {
      setLoadingMyServices(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrdersError("");

      const [buyerData, sellerData] = await Promise.all([
        fetchBuyerOrders(),
        fetchSellerOrders(),
      ]);

      setBuyerOrders(buyerData);
      setSellerOrders(sellerData);
    } catch (err) {
      if (err instanceof Error) {
        setOrdersError(err.message);
      } else {
        setOrdersError("Failed to load orders");
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadMyServices();
    loadOrders();
  }, []);

  const handleUpdateService = async (serviceId: number, payload: ServiceEditForm) => {
    const updated = await updateMyService(serviceId, {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      price: Number(payload.price),
    });

    setMyServices((current) =>
      current.map((service) => (service.id === serviceId ? updated : service))
    );
  };

  const handleDeleteService = async (serviceId: number) => {
    await deleteMyService(serviceId);
    setMyServices((current) => current.filter((service) => service.id !== serviceId));
  };

  const handleToggleServiceStatus = async (serviceId: number, isActive: boolean) => {
    const updated = await updateMyServiceStatus(serviceId, isActive);

    setMyServices((current) =>
      current.map((service) => (service.id === serviceId ? updated : service))
    );
  };

  const handleUpdateOrderStatus = async (orderId: number, status: OrderStatus) => {
    const updated = await updateOrderStatusApi(orderId, status);

    setBuyerOrders((current) =>
      current.map((order) => (order.id === orderId ? updated : order))
    );
    setSellerOrders((current) =>
      current.map((order) => (order.id === orderId ? updated : order))
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleViewChange = (view: View) => {
    if (view === "create") {
      navigate("/dashboard/services/new");
      return;
    }

    if (view === "services") {
      navigate("/dashboard/services");
      return;
    }

    if (view === "orders") {
      navigate("/dashboard/orders");
      return;
    }

    if (view === "messages") {
      navigate("/dashboard/messages");
      return;
    }

    setActiveView(view);
    setSidebarOpen(false);

    if (location.search) {
      navigate("/dashboard", { replace: true });
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "create":
        return <CreateService />;
      case "overview":
        return (
          <OverviewPanel
            loading={loadingMyServices}
            services={myServices}
            error={myServicesError}
            onCreate={() => handleViewChange("create")}
            onUpdate={handleUpdateService}
            onDelete={handleDeleteService}
            onToggleStatus={handleToggleServiceStatus}
          />
        );
      case "services":
        return (
          <MyServicesManagement
            loading={loadingMyServices}
            services={myServices}
            error={myServicesError}
            onCreate={() => handleViewChange("create")}
            onUpdate={handleUpdateService}
            onDelete={handleDeleteService}
            onToggleStatus={handleToggleServiceStatus}
          />
        );
      case "orders":
        return (
          <OrdersManagement
            loading={loadingOrders}
            error={ordersError}
            buyerOrders={buyerOrders}
            sellerOrders={sellerOrders}
            onStatusChange={handleUpdateOrderStatus}
            onBack={() => handleViewChange("overview")}
            currentUserId={user?.userId ?? 0}
          />
        );
      case "messages":
        return <MessagesWorkspace orders={mergedOrders} currentUserId={user?.userId ?? 0} />;
      default:
        return (
          <div className="dashboard-placeholder">
            <h2>Coming Soon</h2>
            <p>This section will unlock when related APIs are added.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <button
        type="button"
        className={`dashboard-overlay ${sidebarOpen ? "show" : ""}`}
        aria-label="Close sidebar"
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <img src={logo} alt="Taskara" />
        </div>

        <p className="sidebar-section-title">Workspace</p>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`sidebar-link ${activeView === item.key ? "active" : ""}`}
              onClick={() => handleViewChange(item.key)}
            >
              <span className="sidebar-icon-wrap">
                <SidebarIcon view={item.key} />
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-toggle"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen((current) => !current)}
            >
              <span />
              <span />
              <span />
            </button>

            <div className="topbar-search">
              <input placeholder="Search services, skills, or categories..." />
            </div>
          </div>

          <div className="topbar-actions">
            <span className="topbar-welcome">Welcome, {user?.name ?? user?.email}</span>
            <button className="btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;
