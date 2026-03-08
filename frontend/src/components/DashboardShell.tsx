import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { getCurrentUser, resolveMediaUrl } from "../utils/api";
import { logout } from "../utils/auth";

type User = {
  userId?: number;
  name?: string;
  email: string;
  avatarUrl?: string | null;
};

type DashboardShellProps = {
  children: ReactNode;
};

const DashboardShell = ({ children }: DashboardShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [topbarQuery, setTopbarQuery] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
        setAvatarBroken(false);
      } catch {
        logout();
        navigate("/login");
      }
    };

    fetchUser();

    const handleUserUpdated = () => {
      fetchUser();
    };

    window.addEventListener("taskara:user-updated", handleUserUpdated);
    return () => {
      window.removeEventListener("taskara:user-updated", handleUserUpdated);
    };
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleOpenProfile = () => {
    if (!user?.userId) {
      return;
    }

    navigate(`/profile/${user.userId}`);
  };

  const avatarSrc = resolveMediaUrl(user?.avatarUrl);

  useEffect(() => {
    if (!location.pathname.startsWith("/dashboard")) {
      return;
    }

    const params = new URLSearchParams(location.search);
    setTopbarQuery(params.get("q") ?? "");
  }, [location.pathname, location.search]);

  const handleTopbarSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = topbarQuery.trim();
    const params = new URLSearchParams();
    if (q) {
      params.set("q", q);
    }
    navigate(`/dashboard${params.toString() ? `?${params.toString()}` : ""}`);
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
          <NavLink to="/dashboard/services" end className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            My Listings
          </NavLink>
          <NavLink to="/dashboard/orders" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            Orders
          </NavLink>
          <NavLink to="/dashboard/messages" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            Inbox
          </NavLink>
          <NavLink to="/dashboard/disputes" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            Disputes
          </NavLink>
          <NavLink to="/dashboard/reviews" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            Reviews/Ratings
          </NavLink>
          <NavLink to="/dashboard/settings" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            Settings
          </NavLink>
        </nav>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <form className="topbar-search" onSubmit={handleTopbarSearchSubmit}>
            <input
              placeholder="Search services, skills, or categories..."
              value={topbarQuery}
              onChange={(event) => setTopbarQuery(event.target.value)}
            />
          </form>

          <div className="topbar-actions">
            <button
              type="button"
              className="profile-avatar-btn"
              onClick={handleOpenProfile}
              aria-label="Open my profile"
              disabled={!user?.userId}
            >
              {avatarSrc && !avatarBroken ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="profile-avatar-image"
                  onError={() => setAvatarBroken(true)}
                />
              ) : (
                <span className="profile-avatar-fallback" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4.2 3.6-7 8-7s8 2.8 8 7" />
                  </svg>
                </span>
              )}
            </button>
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
