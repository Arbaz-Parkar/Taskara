import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { logout } from "../utils/auth";
import {
  fetchAdminUsers,
  updateAdminUserStatus,
  type AdminUserRecord,
} from "../utils/api";

type AdminSection = "overview" | "users";

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

  useEffect(() => {
    if (activeSection !== "users") {
      return;
    }

    loadUsers();
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

      setUsersNotice(
        `User ${nextStatus ? "activated" : "deactivated"} successfully.`
      );
    } catch (error) {
      setUsersError(
        error instanceof Error ? error.message : "Failed to update user status"
      );
    } finally {
      setBusyUserId(null);
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
          <button type="button" className="sidebar-link" disabled>
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
            <h2>{activeSection === "users" ? "Users Management" : "Admin Dashboard"}</h2>
          </div>
          <button type="button" className="btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {activeSection === "overview" ? (
          <main className="admin-content-grid">
            <article className="admin-stat-card">
              <strong>Users</strong>
              <span>Management module is live in the Users tab.</span>
            </article>
            <article className="admin-stat-card">
              <strong>Services</strong>
              <span>Moderation module coming next.</span>
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
        ) : (
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
                          <td>{user.role.name}</td>
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
      </section>
    </div>
  );
};

export default AdminDashboard;
