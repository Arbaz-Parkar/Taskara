import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyServices, getCurrentUser } from "../utils/api";
import { logout } from "../utils/auth";
import logo from "../assets/logo.png";

import Marketplace from "./Marketplace";
import CreateService from "./CreateService.tsx";

type User = {
  userId: number;
  name: string;
  email: string;
};

type Service = {
  id: number;
  title: string;
  category: string;
  price: number;
  seller: {
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

const MyListingsPanel = ({
  loading,
  services,
  error,
  onCreate,
}: {
  loading: boolean;
  services: Service[];
  error: string;
  onCreate: () => void;
}) => {
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

  if (services.length === 0) {
    return (
      <div className="dashboard-placeholder">
        <h2>No listings yet</h2>
        <p>Create your first service to appear in the marketplace.</p>
        <button type="button" className="btn-primary" onClick={onCreate}>
          Create Service
        </button>
      </div>
    );
  }

  return (
    <section className="overview-market-section">
      <div className="overview-market-head">
        <h3>Your Live Listings ({services.length})</h3>
        <p>These listings are visible to other users in the marketplace.</p>
      </div>

      <div className="marketplace-grid">
        {services.map((service) => (
          <article key={service.id} className="service-market-card">
            <div className="service-image-placeholder" />
            <div className="service-info">
              <p className="service-category">{service.category}</p>
              <h3>{service.title}</h3>
              <p className="service-seller">
                by <strong>{service.seller.name}</strong>
              </p>
              <div className="service-footer">
                <span>Starting at</span>
                <strong>?{service.price}</strong>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const OverviewPanel = ({
  loading,
  services,
  error,
  onCreate,
}: {
  loading: boolean;
  services: Service[];
  error: string;
  onCreate: () => void;
}) => {
  return (
    <div className="overview-shell">
      <section className="overview-hero-card">
        <div>
          <p className="overview-kicker">Seller Command Center</p>
          <h2>Build services, publish them, and get discovered by buyers.</h2>
          <p>
            Everything below is real-time data from your listings and live
            marketplace services.
          </p>
        </div>

        <div className="overview-actions">
          <button type="button" className="btn-primary" onClick={onCreate}>
            + New Service
          </button>
        </div>
      </section>

      <MyListingsPanel
        loading={loading}
        services={services}
        error={error}
        onCreate={onCreate}
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
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<View>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [loadingMyServices, setLoadingMyServices] = useState(true);
  const [myServicesError, setMyServicesError] = useState("");

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

  useEffect(() => {
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

    loadMyServices();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleViewChange = (view: View) => {
    setActiveView(view);
    setSidebarOpen(false);
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
          />
        );
      case "services":
        return (
          <MyListingsPanel
            loading={loadingMyServices}
            services={myServices}
            error={myServicesError}
            onCreate={() => handleViewChange("create")}
          />
        );
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
            <span className="topbar-welcome">Welcome, {user?.name}</span>
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
