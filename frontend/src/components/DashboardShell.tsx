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
  const [marketCategory, setMarketCategory] = useState("");
  const [marketMinPrice, setMarketMinPrice] = useState("");
  const [marketMaxPrice, setMarketMaxPrice] = useState("");
  const [marketMinRating, setMarketMinRating] = useState("");
  const [marketResponseSpeed, setMarketResponseSpeed] = useState<"" | "FAST" | "DAY" | "SLOW">("");
  const [marketSort, setMarketSort] = useState<
    "BEST_MATCH" | "PRICE_LOW_HIGH" | "PRICE_HIGH_LOW" | "RATING_HIGH_LOW" | "RESPONSE_FAST"
  >("BEST_MATCH");

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
  const isMarketplaceRoute = location.pathname === "/dashboard";

  useEffect(() => {
    if (!isMarketplaceRoute) {
      return;
    }

    const params = new URLSearchParams(location.search);
    setTopbarQuery(params.get("q") ?? "");
    setMarketCategory(params.get("category") ?? "");
    setMarketMinPrice(params.get("minPrice") ?? "");
    setMarketMaxPrice(params.get("maxPrice") ?? "");
    setMarketMinRating(params.get("minRating") ?? "");
    const responseSpeed = params.get("responseSpeed");
    setMarketResponseSpeed(
      responseSpeed === "FAST" || responseSpeed === "DAY" || responseSpeed === "SLOW"
        ? responseSpeed
        : ""
    );
    const sort = params.get("sort");
    setMarketSort(
      sort === "PRICE_LOW_HIGH" ||
        sort === "PRICE_HIGH_LOW" ||
        sort === "RATING_HIGH_LOW" ||
        sort === "RESPONSE_FAST" ||
        sort === "BEST_MATCH"
        ? sort
        : "BEST_MATCH"
    );
  }, [isMarketplaceRoute, location.search]);

  const handleTopbarSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = topbarQuery.trim();
    const params = new URLSearchParams();
    if (q) {
      params.set("q", q);
    }
    if (marketCategory.trim()) params.set("category", marketCategory.trim());
    if (marketMinPrice.trim()) params.set("minPrice", marketMinPrice.trim());
    if (marketMaxPrice.trim()) params.set("maxPrice", marketMaxPrice.trim());
    if (marketMinRating.trim()) params.set("minRating", marketMinRating.trim());
    if (marketResponseSpeed) params.set("responseSpeed", marketResponseSpeed);
    if (marketSort) params.set("sort", marketSort);
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
            Marketplace
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
          <form className="topbar-search-form" onSubmit={handleTopbarSearchSubmit}>
            <div className="topbar-search">
              <input
                placeholder="Search services, skills, or categories..."
                value={topbarQuery}
                onChange={(event) => setTopbarQuery(event.target.value)}
              />
            </div>
            {isMarketplaceRoute ? (
              <div className="topbar-smart-filters">
                <select value={marketCategory} onChange={(event) => setMarketCategory(event.target.value)}>
                  <option value="">All categories</option>
                  <option value="Website">Website</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Writing">Writing</option>
                  <option value="Video">Video</option>
                  <option value="AI">AI</option>
                  <option value="Business">Business</option>
                </select>
                <input
                  type="number"
                  min={0}
                  value={marketMinPrice}
                  onChange={(event) => setMarketMinPrice(event.target.value)}
                  placeholder="Min INR"
                />
                <input
                  type="number"
                  min={0}
                  value={marketMaxPrice}
                  onChange={(event) => setMarketMaxPrice(event.target.value)}
                  placeholder="Max INR"
                />
                <select value={marketMinRating} onChange={(event) => setMarketMinRating(event.target.value)}>
                  <option value="">Any rating</option>
                  <option value="4.5">4.5+</option>
                  <option value="4">4.0+</option>
                  <option value="3.5">3.5+</option>
                  <option value="3">3.0+</option>
                </select>
                <select
                  value={marketResponseSpeed}
                  onChange={(event) =>
                    setMarketResponseSpeed(event.target.value as "" | "FAST" | "DAY" | "SLOW")
                  }
                >
                  <option value="">Any speed</option>
                  <option value="FAST">Fast</option>
                  <option value="DAY">Within 24h</option>
                  <option value="SLOW">Slow</option>
                </select>
                <select
                  value={marketSort}
                  onChange={(event) =>
                    setMarketSort(
                      event.target.value as
                        | "BEST_MATCH"
                        | "PRICE_LOW_HIGH"
                        | "PRICE_HIGH_LOW"
                        | "RATING_HIGH_LOW"
                        | "RESPONSE_FAST"
                    )
                  }
                >
                  <option value="BEST_MATCH">Best Match</option>
                  <option value="PRICE_LOW_HIGH">Price Low-High</option>
                  <option value="PRICE_HIGH_LOW">Price High-Low</option>
                  <option value="RATING_HIGH_LOW">Top Rated</option>
                  <option value="RESPONSE_FAST">Fast Response</option>
                </select>
                <button type="submit" className="btn-outline topbar-apply-btn">
                  Apply
                </button>
              </div>
            ) : null}
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
