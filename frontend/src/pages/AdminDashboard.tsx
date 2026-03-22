import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { logout } from "../utils/auth";
import {
  fetchAdminDisputes,
  fetchDisputeById,
  deleteAdminService,
  fetchAdminOrders,
  fetchAdminReports,
  fetchAdminServices,
  fetchAdminUsers,
  getCurrentUser,
  resolveMediaUrl,
  sendDisputeMessage,
  updateAdminDisputeStatus,
  updateAdminOrderStatus,
  updateAdminServiceStatus,
  updateAdminUserStatus,
  type AdminDisputeRecord,
  type AdminOrderRecord,
  type AdminReports,
  type AdminServiceRecord,
  type AdminUserRecord,
  type DisputeMessage,
  type DisputeStatus,
  type OrderStatus,
} from "../utils/api";
import { formatServicePrice, getPricingModelLabel } from "../utils/servicePricing";

type AdminSection = "overview" | "users" | "services" | "orders" | "disputes" | "reports";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type OrderFilter = "ALL" | OrderStatus;
type DisputeFilter = "ALL" | DisputeStatus;
type AdminDisputeDetail = Omit<AdminDisputeRecord, "messages"> & {
  messages: DisputeMessage[];
  timeline?: {
    key: string;
    label: string;
    at: string;
    actor: {
      name: string;
    };
  }[];
};

type PendingAttachment = {
  id: string;
  file: File;
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const orderFilterOptions: OrderFilter[] = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

const disputeFilterOptions: DisputeFilter[] = [
  "ALL",
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED",
  "REJECTED",
];

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      if (!base64) {
        reject(new Error("Failed to read file"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const formatBytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [currentAdminId, setCurrentAdminId] = useState<number>(0);

  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [usersNotice, setUsersNotice] = useState("");
  const [usersQuery, setUsersQuery] = useState("");
  const [usersFilter, setUsersFilter] = useState<StatusFilter>("ALL");
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  const [services, setServices] = useState<AdminServiceRecord[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState("");
  const [servicesNotice, setServicesNotice] = useState("");
  const [servicesQuery, setServicesQuery] = useState("");
  const [servicesFilter, setServicesFilter] = useState<StatusFilter>("ALL");
  const [busyServiceId, setBusyServiceId] = useState<number | null>(null);

  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [ordersNotice, setOrdersNotice] = useState("");
  const [ordersQuery, setOrdersQuery] = useState("");
  const [ordersFilter, setOrdersFilter] = useState<OrderFilter>("ALL");
  const [busyOrderId, setBusyOrderId] = useState<number | null>(null);
  const [orderStatusDraft, setOrderStatusDraft] = useState<Record<number, OrderStatus>>({});

  const [disputes, setDisputes] = useState<AdminDisputeRecord[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [disputesError, setDisputesError] = useState("");
  const [disputesNotice, setDisputesNotice] = useState("");
  const [disputesQuery, setDisputesQuery] = useState("");
  const [disputesFilter, setDisputesFilter] = useState<DisputeFilter>("ALL");
  const [selectedDisputeId, setSelectedDisputeId] = useState<number | null>(null);
  const [selectedDisputeThread, setSelectedDisputeThread] = useState<AdminDisputeDetail | null>(null);
  const [disputeReplyText, setDisputeReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState<PendingAttachment[]>([]);
  const [busyDisputeId, setBusyDisputeId] = useState<number | null>(null);
  const [disputeStatusDraft, setDisputeStatusDraft] = useState<Record<number, DisputeStatus>>({});

  const [reports, setReports] = useState<AdminReports | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError("");
      setUsers(await fetchAdminUsers());
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      setServicesLoading(true);
      setServicesError("");
      setServices(await fetchAdminServices());
    } catch (error) {
      setServicesError(error instanceof Error ? error.message : "Failed to load services");
    } finally {
      setServicesLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError("");
      const data = await fetchAdminOrders();
      setOrders(data);
      setOrderStatusDraft(
        data.reduce<Record<number, OrderStatus>>((acc, order) => {
          acc[order.id] = order.status;
          return acc;
        }, {})
      );
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadDisputes = async (preferredDisputeId?: number) => {
    try {
      setDisputesLoading(true);
      setDisputesError("");
      const data = await fetchAdminDisputes();
      setDisputes(data);
      setDisputeStatusDraft(
        data.reduce<Record<number, DisputeStatus>>((acc, dispute) => {
          acc[dispute.id] = dispute.status;
          return acc;
        }, {})
      );

      const targetId =
        preferredDisputeId ??
        selectedDisputeId ??
        (data.length ? data[0].id : null);

      if (targetId) {
        const detail = (await fetchDisputeById(targetId)) as AdminDisputeDetail;
        setSelectedDisputeId(targetId);
        setSelectedDisputeThread(detail);
      } else {
        setSelectedDisputeId(null);
        setSelectedDisputeThread(null);
      }
    } catch (error) {
      setDisputesError(error instanceof Error ? error.message : "Failed to load disputes");
    } finally {
      setDisputesLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setReportsLoading(true);
      setReportsError("");
      setReports(await fetchAdminReports());
    } catch (error) {
      setReportsError(error instanceof Error ? error.message : "Failed to load reports");
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    const loadAdminUser = async () => {
      try {
        const me = await getCurrentUser();
        setCurrentAdminId(me.user?.userId ?? 0);
      } catch {
        setCurrentAdminId(0);
      }
    };
    void loadAdminUser();
  }, []);

  useEffect(() => {
    if (activeSection === "users") loadUsers();
    if (activeSection === "services") loadServices();
    if (activeSection === "orders") loadOrders();
    if (activeSection === "disputes") loadDisputes();
    if (activeSection === "reports" || activeSection === "overview") loadReports();
  }, [activeSection]);

  const usersSummary = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.isActive).length;
    return { total, active, inactive: total - active };
  }, [users]);

  const servicesSummary = useMemo(() => {
    const total = services.length;
    const active = services.filter((service) => service.isActive).length;
    return { total, active, inactive: total - active };
  }, [services]);

  const ordersSummary = useMemo(() => {
    const total = orders.length;
    return {
      total,
      pending: orders.filter((order) => order.status === "PENDING").length,
      inProgress: orders.filter((order) => order.status === "IN_PROGRESS").length,
      completed: orders.filter((order) => order.status === "COMPLETED").length,
    };
  }, [orders]);

  const disputesSummary = useMemo(() => {
    const total = disputes.length;
    const open = disputes.filter((dispute) => dispute.status === "OPEN").length;
    const underReview = disputes.filter((dispute) => dispute.status === "UNDER_REVIEW").length;
    const resolved = disputes.filter((dispute) => dispute.status === "RESOLVED").length;
    return { total, open, underReview, resolved };
  }, [disputes]);

  const filteredUsers = useMemo(() => {
    const query = usersQuery.trim().toLowerCase();
    return users.filter((user) => {
      const statusMatch =
        usersFilter === "ALL" ||
        (usersFilter === "ACTIVE" && user.isActive) ||
        (usersFilter === "INACTIVE" && !user.isActive);
      const queryMatch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.name.toLowerCase().includes(query);
      return statusMatch && queryMatch;
    });
  }, [users, usersFilter, usersQuery]);

  const filteredServices = useMemo(() => {
    const query = servicesQuery.trim().toLowerCase();
    return services.filter((service) => {
      const statusMatch =
        servicesFilter === "ALL" ||
        (servicesFilter === "ACTIVE" && service.isActive) ||
        (servicesFilter === "INACTIVE" && !service.isActive);
      const queryMatch =
        !query ||
        service.title.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.seller.name.toLowerCase().includes(query) ||
        service.seller.email.toLowerCase().includes(query);
      return statusMatch && queryMatch;
    });
  }, [services, servicesFilter, servicesQuery]);

  const filteredOrders = useMemo(() => {
    const query = ordersQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const statusMatch = ordersFilter === "ALL" || order.status === ordersFilter;
      const queryMatch =
        !query ||
        String(order.id).includes(query) ||
        order.service.title.toLowerCase().includes(query) ||
        order.buyer.name.toLowerCase().includes(query) ||
        order.seller.name.toLowerCase().includes(query);
      return statusMatch && queryMatch;
    });
  }, [orders, ordersFilter, ordersQuery]);

  const filteredDisputes = useMemo(() => {
    const query = disputesQuery.trim().toLowerCase();
    return disputes.filter((dispute) => {
      const statusMatch = disputesFilter === "ALL" || dispute.status === disputesFilter;
      const queryMatch =
        !query ||
        String(dispute.id).includes(query) ||
        String(dispute.orderId).includes(query) ||
        dispute.order.service.title.toLowerCase().includes(query) ||
        dispute.buyer.name.toLowerCase().includes(query) ||
        dispute.seller.name.toLowerCase().includes(query) ||
        dispute.reason.toLowerCase().includes(query);
      return statusMatch && queryMatch;
    });
  }, [disputes, disputesFilter, disputesQuery]);

  const handleToggleUserStatus = async (userId: number, nextStatus: boolean) => {
    try {
      setBusyUserId(userId);
      setUsersNotice("");
      setUsersError("");
      const updated = await updateAdminUserStatus(userId, nextStatus);
      setUsers((current) =>
        current.map((user) =>
          user.id === updated.id ? { ...user, isActive: updated.isActive } : user
        )
      );
      setUsersNotice(`User ${nextStatus ? "activated" : "deactivated"} successfully.`);
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : "Failed to update user status");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleToggleServiceStatus = async (serviceId: number, nextStatus: boolean) => {
    try {
      setBusyServiceId(serviceId);
      setServicesNotice("");
      setServicesError("");
      const updated = await updateAdminServiceStatus(serviceId, nextStatus);
      setServices((current) =>
        current.map((service) => (service.id === serviceId ? updated : service))
      );
      setServicesNotice(
        `Service ${nextStatus ? "activated" : "deactivated"} successfully.`
      );
    } catch (error) {
      setServicesError(
        error instanceof Error ? error.message : "Failed to update service status"
      );
    } finally {
      setBusyServiceId(null);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!window.confirm("Delete this service permanently? This cannot be undone.")) return;
    try {
      setBusyServiceId(serviceId);
      setServicesNotice("");
      setServicesError("");
      await deleteAdminService(serviceId);
      setServices((current) => current.filter((service) => service.id !== serviceId));
      setServicesNotice("Service deleted successfully.");
    } catch (error) {
      setServicesError(error instanceof Error ? error.message : "Failed to delete service");
    } finally {
      setBusyServiceId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number) => {
    const nextStatus = orderStatusDraft[orderId];
    if (!nextStatus) return;
    try {
      setBusyOrderId(orderId);
      setOrdersNotice("");
      setOrdersError("");
      const updated = await updateAdminOrderStatus(orderId, nextStatus);
      setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
      setOrdersNotice("Order status updated successfully.");
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : "Failed to update order status");
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleSelectDispute = async (disputeId: number) => {
    try {
      setBusyDisputeId(disputeId);
      setDisputesError("");
      const detail = (await fetchDisputeById(disputeId)) as AdminDisputeDetail;
      setSelectedDisputeId(disputeId);
      setSelectedDisputeThread(detail);
    } catch (error) {
      setDisputesError(error instanceof Error ? error.message : "Failed to load dispute thread");
    } finally {
      setBusyDisputeId(null);
    }
  };

  const handleDisputeReplyFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (!selected.length) {
      return;
    }

    setReplyFiles((current) => {
      const existing = new Set(current.map((item) => item.id));
      const merged = [...current];
      selected
        .filter((file) => file.size <= 10 * 1024 * 1024)
        .slice(0, 5)
        .forEach((file) => {
          const id = `${file.name}-${file.size}-${file.lastModified}`;
          if (!existing.has(id)) {
            merged.push({ id, file });
          }
        });
      return merged.slice(0, 5);
    });

    event.target.value = "";
  };

  const handleRemoveReplyAttachment = (id: string) => {
    setReplyFiles((current) => current.filter((item) => item.id !== id));
  };

  const handleSendDisputeReply = async () => {
    if (!selectedDisputeId) {
      return;
    }

    const hasText = Boolean(disputeReplyText.trim());
    const hasFiles = replyFiles.length > 0;
    if (!hasText && !hasFiles) {
      setDisputesError("Enter a reply or attach at least one file.");
      return;
    }

    try {
      setBusyDisputeId(selectedDisputeId);
      setDisputesError("");
      setDisputesNotice("");
      const attachments = await Promise.all(
        replyFiles.map(async ({ file }) => ({
          fileName: file.name,
          mimeType: file.type,
          dataBase64: await fileToBase64(file),
        }))
      );

      await sendDisputeMessage(selectedDisputeId, {
        content: disputeReplyText.trim(),
        attachments,
      });

      const detail = (await fetchDisputeById(selectedDisputeId)) as AdminDisputeDetail;
      setSelectedDisputeThread(detail);
      setDisputeReplyText("");
      setReplyFiles([]);
      setDisputesNotice("Reply sent successfully.");
      await loadDisputes(selectedDisputeId);
    } catch (error) {
      setDisputesError(error instanceof Error ? error.message : "Failed to send dispute reply");
    } finally {
      setBusyDisputeId(null);
    }
  };

  const handleUpdateDisputeStatus = async (disputeId: number) => {
    const nextStatus = disputeStatusDraft[disputeId];
    if (!nextStatus) {
      return;
    }

    try {
      setBusyDisputeId(disputeId);
      setDisputesError("");
      setDisputesNotice("");
      const updated = await updateAdminDisputeStatus(disputeId, nextStatus);
      setDisputes((current) =>
        current.map((dispute) => (dispute.id === disputeId ? { ...dispute, ...updated } : dispute))
      );
      if (selectedDisputeId === disputeId) {
        const detail = (await fetchDisputeById(disputeId)) as AdminDisputeDetail;
        setSelectedDisputeThread(detail);
      }
      setDisputesNotice("Dispute status updated successfully.");
    } catch (error) {
      setDisputesError(
        error instanceof Error ? error.message : "Failed to update dispute status"
      );
    } finally {
      setBusyDisputeId(null);
    }
  };

  const pageTitle =
    activeSection === "users"
      ? "Users Management"
      : activeSection === "services"
        ? "Services Management"
        : activeSection === "orders"
          ? "Orders Management"
          : activeSection === "disputes"
            ? "Disputes Inbox"
            : activeSection === "reports"
              ? "Reports"
              : "Admin Dashboard";

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <img src={logo} alt="Taskara" className="admin-logo" />
        <p className="sidebar-section-title">Admin Panel</p>
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-link ${activeSection === "overview" ? "active" : ""}`}
            onClick={() => setActiveSection("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`sidebar-link ${activeSection === "users" ? "active" : ""}`}
            onClick={() => setActiveSection("users")}
          >
            Users
          </button>
          <button
            type="button"
            className={`sidebar-link ${activeSection === "services" ? "active" : ""}`}
            onClick={() => setActiveSection("services")}
          >
            Services
          </button>
          <button
            type="button"
            className={`sidebar-link ${activeSection === "orders" ? "active" : ""}`}
            onClick={() => setActiveSection("orders")}
          >
            Orders
          </button>
          <button
            type="button"
            className={`sidebar-link ${activeSection === "disputes" ? "active" : ""}`}
            onClick={() => setActiveSection("disputes")}
          >
            Disputes
          </button>
          <button
            type="button"
            className={`sidebar-link ${activeSection === "reports" ? "active" : ""}`}
            onClick={() => setActiveSection("reports")}
          >
            Reports
          </button>
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="overview-kicker">Taskara Admin</p>
            <h2>{pageTitle}</h2>
          </div>
          <button type="button" className="btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {activeSection === "overview" && (
          <main className="admin-overview-shell">
            {reportsError && <p className="form-status form-status-error">{reportsError}</p>}
            {reportsLoading || !reports ? (
              <div className="dashboard-placeholder compact-placeholder">Loading overview...</div>
            ) : (
              <>
                <section className="admin-reports-kpi-grid">
                  <article className="admin-stat-card">
                    <strong>{reports.totals.users}</strong>
                    <span>Total Users</span>
                  </article>
                  <article className="admin-stat-card">
                    <strong>{reports.totals.services}</strong>
                    <span>Total Services</span>
                  </article>
                  <article className="admin-stat-card">
                    <strong>{reports.totals.orders}</strong>
                    <span>Total Orders</span>
                  </article>
                  <article className="admin-stat-card">
                    <strong>{reports.totals.reviews}</strong>
                    <span>Total Reviews</span>
                  </article>
                </section>

                <section className="admin-overview-grid">
                  <article className="admin-users-card">
                    <div className="overview-market-head">
                      <h3>Platform Health</h3>
                      <p>Current active and inactive distribution.</p>
                    </div>
                    <div className="admin-reports-status-grid">
                      <article className="admin-stat-card">
                        <strong>{reports.totals.activeUsers}</strong>
                        <span>Active Users</span>
                      </article>
                      <article className="admin-stat-card">
                        <strong>{reports.totals.activeServices}</strong>
                        <span>Active Services</span>
                      </article>
                      <article className="admin-stat-card">
                        <strong>{reports.totals.inactiveUsers + reports.totals.inactiveServices}</strong>
                        <span>Total Inactive Entities</span>
                      </article>
                    </div>
                  </article>

                  <article className="admin-users-card">
                    <div className="overview-market-head">
                      <h3>Order Pipeline Snapshot</h3>
                      <p>Live volume across workflow states.</p>
                    </div>
                    <div className="admin-order-snapshot-list">
                      {Object.entries(reports.orderStatus).map(([status, count]) => (
                        <div key={status} className="admin-order-snapshot-row">
                          <span>{status.replaceAll("_", " ")}</span>
                          <strong>{count}</strong>
                        </div>
                      ))}
                    </div>
                  </article>
                </section>

                <section className="admin-users-card">
                  <div className="overview-market-head">
                    <h3>Latest Marketplace Activity</h3>
                    <p>Recent user signups, listings, and orders at a glance.</p>
                  </div>
                  <div className="admin-overview-activity-grid">
                    <article className="admin-overview-activity-card">
                      <h4>Recent Users</h4>
                      <ul>
                        {reports.recentUsers.map((user) => (
                          <li key={user.id}>
                            <strong>{user.name}</strong>
                            <span>{formatDate(user.createdAt)}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                    <article className="admin-overview-activity-card">
                      <h4>Recent Services</h4>
                      <ul>
                        {reports.recentServices.map((service) => (
                          <li key={service.id}>
                            <strong>{service.title}</strong>
                            <span>{service.seller.name}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                    <article className="admin-overview-activity-card">
                      <h4>Recent Orders</h4>
                      <ul>
                        {reports.recentOrders.map((order) => (
                          <li key={order.id}>
                            <strong>{`#${order.id} ${order.service.title}`}</strong>
                            <span>{order.status.replaceAll("_", " ")}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  </div>
                </section>
              </>
            )}
          </main>
        )}

        {activeSection === "users" && (
          <main className="admin-users-shell">
            <section className="admin-users-summary-grid">
              <article className="admin-stat-card"><strong>{usersSummary.total}</strong><span>Total Users</span></article>
              <article className="admin-stat-card"><strong>{usersSummary.active}</strong><span>Active Users</span></article>
              <article className="admin-stat-card"><strong>{usersSummary.inactive}</strong><span>Inactive Users</span></article>
            </section>

            <section className="admin-users-card">
              <div className="admin-users-toolbar">
                <input className="manage-search" placeholder="Search by name, email, role" value={usersQuery} onChange={(event) => setUsersQuery(event.target.value)} />
                <div className="manage-filter-group">
                  {(["ALL", "ACTIVE", "INACTIVE"] as StatusFilter[]).map((option) => (
                    <button key={option} type="button" className={`manage-filter-btn ${usersFilter === option ? "active" : ""}`} onClick={() => setUsersFilter(option)}>
                      {option[0] + option.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {usersError && <p className="form-status form-status-error">{usersError}</p>}
              {usersNotice && <p className="form-status form-status-success">{usersNotice}</p>}

              {usersLoading ? (
                <div className="dashboard-placeholder compact-placeholder">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="dashboard-placeholder compact-placeholder"><h2>No users found</h2><p>Try changing your search or filters.</p></div>
              ) : (
                <div className="admin-users-table-wrap">
                  <table className="admin-users-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Services</th><th>Orders</th><th>Joined</th><th>Action</th></tr></thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td><div className="admin-user-cell"><strong>{user.name}</strong><span>{user.email}</span></div></td>
                          <td>{user.role.name.toUpperCase()}</td>
                          <td><span className={`order-status-chip ${user.isActive ? "completed" : "cancelled"}`}>{user.isActive ? "ACTIVE" : "INACTIVE"}</span></td>
                          <td>{user._count.services}</td>
                          <td>{user._count.buyerOrders + user._count.sellerOrders}</td>
                          <td>{formatDate(user.createdAt)}</td>
                          <td><button type="button" className="btn-outline" disabled={busyUserId === user.id} onClick={() => handleToggleUserStatus(user.id, !user.isActive)}>{busyUserId === user.id ? "Updating..." : user.isActive ? "Deactivate" : "Activate"}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </main>
        )}

        {activeSection === "services" && (
          <main className="admin-users-shell">
            <section className="admin-users-summary-grid">
              <article className="admin-stat-card"><strong>{servicesSummary.total}</strong><span>Total Services</span></article>
              <article className="admin-stat-card"><strong>{servicesSummary.active}</strong><span>Active Services</span></article>
              <article className="admin-stat-card"><strong>{servicesSummary.inactive}</strong><span>Inactive Services</span></article>
            </section>

            <section className="admin-users-card">
              <div className="admin-users-toolbar">
                <input className="manage-search" placeholder="Search by title, category, seller" value={servicesQuery} onChange={(event) => setServicesQuery(event.target.value)} />
                <div className="manage-filter-group">
                  {(["ALL", "ACTIVE", "INACTIVE"] as StatusFilter[]).map((option) => (
                    <button key={option} type="button" className={`manage-filter-btn ${servicesFilter === option ? "active" : ""}`} onClick={() => setServicesFilter(option)}>
                      {option[0] + option.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {servicesError && <p className="form-status form-status-error">{servicesError}</p>}
              {servicesNotice && <p className="form-status form-status-success">{servicesNotice}</p>}

              {servicesLoading ? (
                <div className="dashboard-placeholder compact-placeholder">Loading services...</div>
              ) : filteredServices.length === 0 ? (
                <div className="dashboard-placeholder compact-placeholder"><h2>No services found</h2><p>Try changing your search or filters.</p></div>
              ) : (
                <div className="admin-users-table-wrap">
                  <table className="admin-users-table"><thead><tr><th>Service</th><th>Seller</th><th>Category</th><th>Price</th><th>Status</th><th>Orders</th><th>Created</th><th>Actions</th></tr></thead>
                    <tbody>
                      {filteredServices.map((service) => (
                        <tr key={service.id}>
                          <td><div className="admin-user-cell"><strong>{service.title}</strong><span>{service.description.slice(0, 80)}</span></div></td>
                          <td><div className="admin-user-cell"><strong>{service.seller.name}</strong><span>{service.seller.email}</span></div></td>
                          <td>{service.category}</td>
                          <td>
                            <div className="admin-user-cell">
                              <strong>{formatServicePrice(service.price, service.pricingModel)}</strong>
                              <span>{getPricingModelLabel(service.pricingModel)}</span>
                            </div>
                          </td>
                          <td><span className={`order-status-chip ${service.isActive ? "completed" : "cancelled"}`}>{service.isActive ? "ACTIVE" : "INACTIVE"}</span></td>
                          <td>{service._count.orders}</td>
                          <td>{formatDate(service.createdAt)}</td>
                          <td><div className="admin-table-actions"><button type="button" className="btn-outline" disabled={busyServiceId === service.id} onClick={() => handleToggleServiceStatus(service.id, !service.isActive)}>{busyServiceId === service.id ? "Updating..." : service.isActive ? "Deactivate" : "Activate"}</button><button type="button" className="btn-outline danger-button" disabled={busyServiceId === service.id} onClick={() => handleDeleteService(service.id)}>Delete</button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </main>
        )}

        {activeSection === "orders" && (
          <main className="admin-users-shell">
            <section className="admin-users-summary-grid">
              <article className="admin-stat-card"><strong>{ordersSummary.total}</strong><span>Total Orders</span></article>
              <article className="admin-stat-card"><strong>{ordersSummary.pending}</strong><span>Pending</span></article>
              <article className="admin-stat-card"><strong>{ordersSummary.inProgress}</strong><span>In Progress</span></article>
              <article className="admin-stat-card"><strong>{ordersSummary.completed}</strong><span>Completed</span></article>
            </section>

            <section className="admin-users-card">
              <div className="admin-users-toolbar">
                <input className="manage-search" placeholder="Search by order id, service, buyer, seller" value={ordersQuery} onChange={(event) => setOrdersQuery(event.target.value)} />
                <div className="manage-filter-group">
                  {orderFilterOptions.map((status) => (
                    <button key={status} type="button" className={`manage-filter-btn ${ordersFilter === status ? "active" : ""}`} onClick={() => setOrdersFilter(status)}>
                      {status === "ALL" ? "All" : status.replaceAll("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {ordersError && <p className="form-status form-status-error">{ordersError}</p>}
              {ordersNotice && <p className="form-status form-status-success">{ordersNotice}</p>}

              {ordersLoading ? (
                <div className="dashboard-placeholder compact-placeholder">Loading orders...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="dashboard-placeholder compact-placeholder"><h2>No orders found</h2><p>Try changing your search or filters.</p></div>
              ) : (
                <div className="admin-users-table-wrap">
                  <table className="admin-users-table"><thead><tr><th>Order</th><th>Service</th><th>Buyer/Seller</th><th>Amount</th><th>Status</th><th>Created</th><th>Admin Action</th></tr></thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td><div className="admin-user-cell"><strong>{order.service.title}</strong><span>{order.service.category}</span></div></td>
                          <td><div className="admin-user-cell"><strong>B: {order.buyer.name}</strong><span>S: {order.seller.name}</span></div></td>
                          <td>{`\u20B9${order.amount}`}</td>
                          <td><span className={`order-status-chip ${order.status.toLowerCase()}`}>{order.status.replaceAll("_", " ")}</span></td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            <div className="admin-table-actions">
                              <select className="admin-status-select" value={orderStatusDraft[order.id] ?? order.status} onChange={(event) => setOrderStatusDraft((current) => ({ ...current, [order.id]: event.target.value as OrderStatus }))}>
                                {orderFilterOptions.filter((item) => item !== "ALL").map((item) => (<option key={item} value={item}>{item.replaceAll("_", " ")}</option>))}
                              </select>
                              <button type="button" className="btn-outline" disabled={busyOrderId === order.id} onClick={() => handleUpdateOrderStatus(order.id)}>{busyOrderId === order.id ? "Updating..." : "Apply"}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </main>
        )}

        {activeSection === "disputes" && (
          <main className="admin-users-shell">
            <section className="admin-users-summary-grid">
              <article className="admin-stat-card"><strong>{disputesSummary.total}</strong><span>Total Disputes</span></article>
              <article className="admin-stat-card"><strong>{disputesSummary.open}</strong><span>Open</span></article>
              <article className="admin-stat-card"><strong>{disputesSummary.underReview}</strong><span>Under Review</span></article>
              <article className="admin-stat-card"><strong>{disputesSummary.resolved}</strong><span>Resolved</span></article>
            </section>

            <section className="admin-users-card">
              <div className="admin-users-toolbar">
                <input
                  className="manage-search"
                  placeholder="Search by dispute id, order id, service, buyer, seller"
                  value={disputesQuery}
                  onChange={(event) => setDisputesQuery(event.target.value)}
                />
                <div className="manage-filter-group">
                  {disputeFilterOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`manage-filter-btn ${disputesFilter === status ? "active" : ""}`}
                      onClick={() => setDisputesFilter(status)}
                    >
                      {status === "ALL" ? "All" : status.replaceAll("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {disputesError && <p className="form-status form-status-error">{disputesError}</p>}
              {disputesNotice && <p className="form-status form-status-success">{disputesNotice}</p>}

              {disputesLoading ? (
                <div className="dashboard-placeholder compact-placeholder">Loading disputes...</div>
              ) : filteredDisputes.length === 0 ? (
                <div className="dashboard-placeholder compact-placeholder"><h2>No disputes found</h2><p>Try changing your search or filters.</p></div>
              ) : (
                <div className="messages-shell">
                  <section className="messages-list-panel">
                    <h3>Dispute Cases</h3>
                    <div className="messages-list">
                      {filteredDisputes.map((dispute) => (
                        <button
                          key={dispute.id}
                          type="button"
                          className={`message-thread-btn ${selectedDisputeId === dispute.id ? "active" : ""}`}
                          onClick={() => handleSelectDispute(dispute.id)}
                          disabled={busyDisputeId === dispute.id}
                        >
                          <div className="message-thread-inner">
                            <AvatarCircle name={dispute.raisedBy.name} avatarUrl={dispute.raisedBy.avatarUrl} />
                            <div className="message-thread-content">
                              <strong>Dispute #{dispute.id}</strong>
                              <span>Order #{dispute.orderId} | {dispute.order.service.title}</span>
                              <small>{dispute.status.replaceAll("_", " ")}</small>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="messages-chat-panel">
                    {selectedDisputeThread ? (
                      <>
                        <div className="messages-chat-head">
                          <h3>
                            Dispute #{selectedDisputeThread.id} | Order #{selectedDisputeThread.orderId}
                          </h3>
                          <p>
                            Buyer: {selectedDisputeThread.buyer.name} | Seller: {selectedDisputeThread.seller.name}
                          </p>
                        </div>

                        <p className="service-seller">{selectedDisputeThread.reason}</p>

                        <div className="admin-table-actions" style={{ marginBottom: 10 }}>
                          <select
                            className="admin-status-select"
                            value={
                              disputeStatusDraft[selectedDisputeThread.id] ??
                              selectedDisputeThread.status
                            }
                            onChange={(event) =>
                              setDisputeStatusDraft((current) => ({
                                ...current,
                                [selectedDisputeThread.id]: event.target.value as DisputeStatus,
                              }))
                            }
                          >
                            {disputeFilterOptions.filter((status) => status !== "ALL").map((status) => (
                              <option key={status} value={status}>
                                {status.replaceAll("_", " ")}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={() => handleUpdateDisputeStatus(selectedDisputeThread.id)}
                            disabled={busyDisputeId === selectedDisputeThread.id}
                          >
                            {busyDisputeId === selectedDisputeThread.id ? "Updating..." : "Apply Status"}
                          </button>
                        </div>

                        <div className="messages-chat-list">
                          {selectedDisputeThread.messages.length === 0 ? (
                            <p className="service-seller">No dispute messages yet.</p>
                          ) : (
                            selectedDisputeThread.messages.map((message) => (
                              <div
                                key={message.id}
                                className={`message-chat-row ${
                                  message.senderId === currentAdminId ? "outgoing" : "incoming"
                                }`}
                              >
                                <AvatarCircle name={message.sender.name} avatarUrl={message.sender.avatarUrl} />
                                <div
                                  className={`order-chat-item ${
                                    message.senderId === currentAdminId ? "outgoing" : "incoming"
                                  }`}
                                >
                                  <strong>
                                    {message.sender.name}{" "}
                                    {message.sender.role?.name?.toLowerCase() === "admin"
                                      ? "(Admin)"
                                      : ""}
                                  </strong>
                                  <p>{message.content}</p>
                                  {(message.attachments ?? []).length > 0 && (
                                    <div className="sent-attachment-grid">
                                      {(message.attachments ?? []).map((attachment) => (
                                        <a
                                          key={attachment.id}
                                          href={attachment.fileUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="sent-attachment-card"
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
                            value={disputeReplyText}
                            onChange={(event) => setDisputeReplyText(event.target.value)}
                            placeholder="Reply to buyer/seller in this dispute..."
                          />
                          <label className="message-attach-btn" aria-label="Attach files">
                            Attach
                            <input type="file" multiple onChange={handleDisputeReplyFileChange} />
                          </label>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={handleSendDisputeReply}
                            disabled={busyDisputeId === selectedDisputeThread.id}
                          >
                            Send
                          </button>
                        </div>
                        {replyFiles.length > 0 ? (
                          <div className="message-attachment-list">
                            {replyFiles.map(({ id, file }) => (
                              <div key={id} className="message-attachment-chip">
                                <span>{`${file.name} (${formatBytes(file.size)})`}</span>
                                <button type="button" onClick={() => handleRemoveReplyAttachment(id)}>
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <p className="messages-upnext-note">
                          Uploaded files are attached to this dispute message and visible to all involved parties.
                        </p>

                        {selectedDisputeThread.timeline?.length ? (
                          <div className="orders-section-card">
                            <div className="orders-section-head">
                              <h3>Status Timeline</h3>
                            </div>
                            <div className="order-chat-list">
                              {selectedDisputeThread.timeline.map((event) => (
                                <article key={event.key} className="order-chat-item incoming">
                                  <strong>{event.label}</strong>
                                  <p>
                                    {new Date(event.at).toLocaleString()} by {event.actor.name}
                                  </p>
                                </article>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="dashboard-placeholder compact-placeholder">
                        Select a dispute from the left to review and respond.
                      </div>
                    )}
                  </section>
                </div>
              )}
            </section>
          </main>
        )}

        {activeSection === "reports" && (
          <main className="admin-users-shell">
            {reportsError && <p className="form-status form-status-error">{reportsError}</p>}
            {reportsLoading || !reports ? (
              <div className="dashboard-placeholder compact-placeholder">Loading reports...</div>
            ) : (
              <>
                <section className="admin-reports-kpi-grid">
                  <article className="admin-stat-card"><strong>{reports.totals.users}</strong><span>Total Users</span></article>
                  <article className="admin-stat-card"><strong>{reports.totals.services}</strong><span>Total Services</span></article>
                  <article className="admin-stat-card"><strong>{reports.totals.orders}</strong><span>Total Orders</span></article>
                  <article className="admin-stat-card"><strong>{reports.totals.reviews}</strong><span>Total Reviews</span></article>
                </section>

                <section className="admin-users-card">
                  <div className="overview-market-head"><h3>Order Status Distribution</h3><p>Live workflow volume by lifecycle state.</p></div>
                  <div className="admin-reports-status-grid">
                    {Object.entries(reports.orderStatus).map(([status, count]) => (
                      <article key={status} className="admin-stat-card"><strong>{count}</strong><span>{status.replaceAll("_", " ")}</span></article>
                    ))}
                  </div>
                </section>
              </>
            )}
          </main>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
