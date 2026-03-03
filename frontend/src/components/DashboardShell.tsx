import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { getCurrentUser } from "../utils/api";
import { logout } from "../utils/auth";

type User = {
  name?: string;
  email: string;
};

type DashboardShellProps = {
  children: ReactNode;
};

const DashboardShell = ({ children }: DashboardShellProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Taskara" />
        </div>

        <p className="sidebar-section-title">Workspace</p>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/dashboard/services/new" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            Create Service
          </NavLink>
          <NavLink to="/dashboard/services" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            My Listings
          </NavLink>
          <NavLink to="/dashboard/orders" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            Orders
          </NavLink>
          <NavLink to="/dashboard/messages" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            Inbox
          </NavLink>
          <NavLink to="/dashboard/settings" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            Settings
          </NavLink>
        </nav>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-search">
            <input placeholder="Search services, skills, or categories..." />
          </div>

          <div className="topbar-actions">
            <span className="topbar-welcome">Welcome, {user?.name ?? user?.email}</span>
            <button className="btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardShell;
