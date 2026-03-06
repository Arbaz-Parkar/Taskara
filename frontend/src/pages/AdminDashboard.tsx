import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { logout } from "../utils/auth";
import {
  deleteAdminService,
  fetchAdminOrders,
  fetchAdminReports,
  fetchAdminServices,
  fetchAdminUsers,
  updateAdminOrderStatus,
  updateAdminServiceStatus,
  updateAdminUserStatus,
  type AdminOrderRecord,
  type AdminReports,
  type AdminServiceRecord,
  type AdminUserRecord,
  type OrderStatus,
} from "../utils/api";

type AdminSection = "overview" | "users" | "services" | "orders" | "reports";
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type OrderFilter = "ALL" | OrderStatus;

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");

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
    if (activeSection === "users") loadUsers();
    if (activeSection === "services") loadServices();
    if (activeSection === "orders") loadOrders();
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

  const pageTitle =
    activeSection === "users"
      ? "Users Management"
      : activeSection === "services"
        ? "Services Management"
        : activeSection === "orders"
          ? "Orders Management"
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
                          <td>{`\u20B9${service.price}`}</td>
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
