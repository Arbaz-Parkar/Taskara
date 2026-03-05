import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { logout } from "../utils/auth";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <img src={logo} alt="Taskara" className="admin-logo" />
        <p className="sidebar-section-title">Admin Panel</p>
        <nav className="sidebar-nav">
          <button type="button" className="sidebar-link active">
            Overview
          </button>
          <button type="button" className="sidebar-link" disabled>
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
            <h2>Admin Dashboard</h2>
          </div>
          <button type="button" className="btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <main className="admin-content-grid">
          <article className="admin-stat-card">
            <strong>Users</strong>
            <span>Management module coming next.</span>
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
      </section>
    </div>
  );
};

export default AdminDashboard;
