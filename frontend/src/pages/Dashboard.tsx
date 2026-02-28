import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser } from "../utils/api";
import { logout } from "../utils/auth";
import logo from "../assets/logo.png";
import Marketplace from "./Marketplace";

type User = {
  id: string;
  name: string;
  email: string;
};

const Dashboard = () => {
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
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Taskara" />
        </div>

        <nav className="sidebar-nav">
          <Link className="sidebar-link" to="/dashboard">
            Overview
          </Link>
          <Link className="sidebar-link" to="#">
            My Services
          </Link>
          <Link className="sidebar-link" to="#">
            Orders
          </Link>
          <Link className="sidebar-link" to="#">
            Messages
          </Link>
          <Link className="sidebar-link" to="#">
            Earnings
          </Link>
          <Link className="sidebar-link" to="#">
            Settings
          </Link>
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="dashboard-main">
        {/* TOPBAR */}
        <header className="dashboard-topbar">
          <div className="topbar-search">
            <input placeholder="Search services..." />
          </div>

          <div className="topbar-actions">
            <span>Welcome, {user?.name}</span>

            <button className="btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="dashboard-content">
          <Marketplace />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;