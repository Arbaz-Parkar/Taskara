import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { logout } from "../utils/auth";
import {
  deleteAdminService,
  fetchAdminServices,
  fetchAdminUsers,
  updateAdminServiceStatus,
  updateAdminUserStatus,
  type AdminServiceRecord,
  type AdminUserRecord,
} from "../utils/api";

type AdminSection = "overview" | "users" | "services";

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");

  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [usersNotice, setUsersNotice] = useState("");
  const [usersQuery, setUsersQuery] = useState("");
  const [usersFilter, setUsersFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  const [services, setServices] = useState<AdminServiceRecord[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState("");
  const [servicesNotice, setServicesNotice] = useState("");
  const [servicesQuery, setServicesQuery] = useState("");
  const [servicesFilter, setServicesFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL"
  );
  const [busyServiceId, setBusyServiceId] = useState<number | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError("");
      const data = await fetchAdminUsers();
      setUsers(data);
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
      const data = await fetchAdminServices();
      setServices(data);
    } catch (error) {
      setServicesError(error instanceof Error ? error.message : "Failed to load services");
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "users") {
      loadUsers();
    }

    if (activeSection === "services") {
      loadServices();
    }
  }, [activeSection]);

  const usersSummary = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.isActive).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [users]);

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

  const servicesSummary = useMemo(() => {
    const total = services.length;
    const active = services.filter((service) => service.isActive).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [services]);

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

  const handleToggleServiceStatus = async (
    serviceId: number,
    nextStatus: boolean
  ) => {
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
    const confirmed = window.confirm(
      "Delete this service permanently? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

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
          <button type="button" className="sidebar-link" disabled>
            Orders
          </button>
          <button type="button" className="sidebar-link" disabled>
            Reports
          </button>
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="overview-kicker">Taskara Admin</p>
            <h2>
              {activeSection === "users"
                ? "Users Management"
                : activeSection === "services"
                  ? "Services Management"
                  : "Admin Dashboard"}
            </h2>
          </div>
          <button type="button" className="btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {activeSection === "overview" && (
          <main className="admin-content-grid">
            <article className="admin-stat-card">
              <strong>Users</strong>
              <span>Manage account status and role visibility.</span>
            </article>
            <article className="admin-stat-card">
              <strong>Services</strong>
              <span>Moderate listings with activate/deactivate/delete controls.</span>
            </article>
            <article className="admin-stat-card">
              <strong>Orders</strong>
              <span>Pipeline controls coming next.</span>
            </article>
            <article className="admin-stat-card">
              <strong>Reports</strong>
              <span>Trust and safety tools coming next.</span>
            </article>
          </main>
        )}

        {activeSection === "users" && (
          <main className="admin-users-shell">
            <section className="admin-users-summary-grid">
              <article className="admin-stat-card">
                <strong>{usersSummary.total}</strong>
                <span>Total Users</span>
              </article>
              <article className="admin-stat-card">
                <strong>{usersSummary.active}</strong>
                <span>Active Users</span>
              </article>
              <article className="admin-stat-card">
                <strong>{usersSummary.inactive}</strong>
                <span>Inactive Users</span>
              </article>
            </section>

            <section className="admin-users-card">
              <div className="admin-users-toolbar">
                <input
                  className="manage-search"
                  placeholder="Search by name, email, role"
                  value={usersQuery}
                  onChange={(event) => setUsersQuery(event.target.value)}
                />
                <div className="manage-filter-group">
                  <button
                    type="button"
                    className={`manage-filter-btn ${usersFilter === "ALL" ? "active" : ""}`}
                    onClick={() => setUsersFilter("ALL")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`manage-filter-btn ${usersFilter === "ACTIVE" ? "active" : ""}`}
                    onClick={() => setUsersFilter("ACTIVE")}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    className={`manage-filter-btn ${usersFilter === "INACTIVE" ? "active" : ""}`}
                    onClick={() => setUsersFilter("INACTIVE")}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              {usersError && <p className="form-status form-status-error">{usersError}</p>}
              {usersNotice && <p className="form-status form-status-success">{usersNotice}</p>}

              {usersLoading ? (
                <div className="dashboard-placeholder compact-placeholder">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="dashboard-placeholder compact-placeholder">
                  <h2>No users found</h2>
                  <p>Try changing your search or filters.</p>
                </div>
              ) : (
                <div className="admin-users-table-wrap">
                  <table className="admin-users-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Services</th>
                        <th>Orders</th>
                        <th>Joined</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="admin-user-cell">
                              <strong>{user.name}</strong>
                              <span>{user.email}</span>
                            </div>
                          </td>
                          <td>{user.role.name.toUpperCase()}</td>
                          <td>
                            <span
                              className={`order-status-chip ${
                                user.isActive ? "completed" : "cancelled"
                              }`}
                            >
                              {user.isActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </td>
                          <td>{user._count.services}</td>
                          <td>{user._count.buyerOrders + user._count.sellerOrders}</td>
                          <td>{formatDate(user.createdAt)}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-outline"
                              disabled={busyUserId === user.id}
                              onClick={() =>
                                handleToggleUserStatus(user.id, !user.isActive)
                              }
                            >
                              {busyUserId === user.id
                                ? "Updating..."
                                : user.isActive
                                  ? "Deactivate"
                                  : "Activate"}
                            </button>
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

        {activeSection === "services" && (
          <main className="admin-users-shell">
            <section className="admin-users-summary-grid">
              <article className="admin-stat-card">
                <strong>{servicesSummary.total}</strong>
                <span>Total Services</span>
              </article>
              <article className="admin-stat-card">
                <strong>{servicesSummary.active}</strong>
                <span>Active Services</span>
              </article>
              <article className="admin-stat-card">
                <strong>{servicesSummary.inactive}</strong>
                <span>Inactive Services</span>
              </article>
            </section>

            <section className="admin-users-card">
              <div className="admin-users-toolbar">
                <input
                  className="manage-search"
                  placeholder="Search by title, category, seller"
                  value={servicesQuery}
                  onChange={(event) => setServicesQuery(event.target.value)}
                />
                <div className="manage-filter-group">
                  <button
                    type="button"
                    className={`manage-filter-btn ${servicesFilter === "ALL" ? "active" : ""}`}
                    onClick={() => setServicesFilter("ALL")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`manage-filter-btn ${servicesFilter === "ACTIVE" ? "active" : ""}`}
                    onClick={() => setServicesFilter("ACTIVE")}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    className={`manage-filter-btn ${servicesFilter === "INACTIVE" ? "active" : ""}`}
                    onClick={() => setServicesFilter("INACTIVE")}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              {servicesError && <p className="form-status form-status-error">{servicesError}</p>}
              {servicesNotice && (
                <p className="form-status form-status-success">{servicesNotice}</p>
              )}

              {servicesLoading ? (
                <div className="dashboard-placeholder compact-placeholder">
                  Loading services...
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="dashboard-placeholder compact-placeholder">
                  <h2>No services found</h2>
                  <p>Try changing your search or filters.</p>
                </div>
              ) : (
                <div className="admin-users-table-wrap">
                  <table className="admin-users-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Seller</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Orders</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((service) => (
                        <tr key={service.id}>
                          <td>
                            <div className="admin-user-cell">
                              <strong>{service.title}</strong>
                              <span>{service.description.slice(0, 80)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="admin-user-cell">
                              <strong>{service.seller.name}</strong>
                              <span>{service.seller.email}</span>
                            </div>
                          </td>
                          <td>{service.category}</td>
                          <td>{`\u20B9${service.price}`}</td>
                          <td>
                            <span
                              className={`order-status-chip ${
                                service.isActive ? "completed" : "cancelled"
                              }`}
                            >
                              {service.isActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </td>
                          <td>{service._count.orders}</td>
                          <td>{formatDate(service.createdAt)}</td>
                          <td>
                            <div className="admin-table-actions">
                              <button
                                type="button"
                                className="btn-outline"
                                disabled={busyServiceId === service.id}
                                onClick={() =>
                                  handleToggleServiceStatus(service.id, !service.isActive)
                                }
                              >
                                {busyServiceId === service.id
                                  ? "Updating..."
                                  : service.isActive
                                    ? "Deactivate"
                                    : "Activate"}
                              </button>
                              <button
                                type="button"
                                className="btn-outline danger-button"
                                disabled={busyServiceId === service.id}
                                onClick={() => handleDeleteService(service.id)}
                              >
                                Delete
                              </button>
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
      </section>
    </div>
  );
};

export default AdminDashboard;
