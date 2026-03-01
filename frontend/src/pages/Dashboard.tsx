import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteMyService,
  fetchMyServices,
  getCurrentUser,
  updateMyService,
  updateMyServiceStatus,
} from "../utils/api";
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
  description: string;
  category: string;
  price: number;
  isActive: boolean;
  createdAt: string;
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

type ServiceEditForm = {
  title: string;
  category: string;
  price: string;
  description: string;
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

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const MyServicesManagement = ({
  loading,
  services,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
}: {
  loading: boolean;
  services: Service[];
  error: string;
  onCreate: () => void;
  onUpdate: (serviceId: number, payload: ServiceEditForm) => Promise<void>;
  onDelete: (serviceId: number) => Promise<void>;
  onToggleStatus: (serviceId: number, isActive: boolean) => Promise<void>;
}) => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ServiceEditForm>({
    title: "",
    category: "",
    price: "",
    description: "",
  });
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [busyServiceId, setBusyServiceId] = useState<number | null>(null);

  const filteredServices = useMemo(() => {
    const search = query.trim().toLowerCase();

    return services.filter((service) => {
      const matchesFilter =
        statusFilter === "all" ||
        (statusFilter === "active" && service.isActive) ||
        (statusFilter === "paused" && !service.isActive);

      const matchesSearch =
        search.length === 0 ||
        service.title.toLowerCase().includes(search) ||
        service.category.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [query, services, statusFilter]);

  const startEdit = (service: Service) => {
    setEditingServiceId(service.id);
    setActionError("");
    setActionSuccess("");
    setEditForm({
      title: service.title,
      category: service.category,
      price: String(service.price),
      description: service.description,
    });
  };

  const cancelEdit = () => {
    setEditingServiceId(null);
    setActionError("");
  };

  const submitEdit = async (serviceId: number) => {
    try {
      setBusyServiceId(serviceId);
      setActionError("");
      setActionSuccess("");
      await onUpdate(serviceId, editForm);
      setActionSuccess("Service updated.");
      setEditingServiceId(null);
    } catch (err) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to update service");
      }
    } finally {
      setBusyServiceId(null);
    }
  };

  const handleToggleStatus = async (serviceId: number, currentStatus: boolean) => {
    try {
      setBusyServiceId(serviceId);
      setActionError("");
      setActionSuccess("");
      await onToggleStatus(serviceId, !currentStatus);
      setActionSuccess(currentStatus ? "Service paused." : "Service reactivated.");
    } catch (err) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to update service status");
      }
    } finally {
      setBusyServiceId(null);
    }
  };

  const handleDelete = async (serviceId: number, title: string) => {
    const confirmed = window.confirm(`Delete "${title}" permanently?`);
    if (!confirmed) {
      return;
    }

    try {
      setBusyServiceId(serviceId);
      setActionError("");
      setActionSuccess("");
      await onDelete(serviceId);
      setActionSuccess("Service deleted.");
      if (editingServiceId === serviceId) {
        setEditingServiceId(null);
      }
    } catch (err) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to delete service");
      }
    } finally {
      setBusyServiceId(null);
    }
  };

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

  return (
    <section className="overview-market-section">
      <div className="manage-head-row">
        <div className="overview-market-head">
          <h3>My Services Management</h3>
          <p>Edit, pause, reactivate, and delete your listings.</p>
        </div>

        <button type="button" className="btn-primary" onClick={onCreate}>
          + Create Service
        </button>
      </div>

      <div className="manage-toolbar">
        <input
          className="manage-search"
          placeholder="Search by title or category"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="manage-filter-group" role="tablist" aria-label="Service status filter">
          <button
            type="button"
            className={`manage-filter-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`manage-filter-btn ${statusFilter === "active" ? "active" : ""}`}
            onClick={() => setStatusFilter("active")}
          >
            Active
          </button>
          <button
            type="button"
            className={`manage-filter-btn ${statusFilter === "paused" ? "active" : ""}`}
            onClick={() => setStatusFilter("paused")}
          >
            Paused
          </button>
        </div>
      </div>

      {actionError && <p className="form-status form-status-error">{actionError}</p>}
      {actionSuccess && <p className="form-status form-status-success">{actionSuccess}</p>}

      {filteredServices.length === 0 ? (
        <div className="dashboard-placeholder">
          <h2>No matching listings</h2>
          <p>Try adjusting your search/filter or create a new service.</p>
        </div>
      ) : (
        <div className="manage-list-grid">
          {filteredServices.map((service) => {
            const isEditing = editingServiceId === service.id;
            const isBusy = busyServiceId === service.id;

            return (
              <article key={service.id} className="manage-service-card">
                <div className="manage-service-header">
                  <span className={`manage-status-chip ${service.isActive ? "active" : "paused"}`}>
                    {service.isActive ? "Active" : "Paused"}
                  </span>
                  <span className="manage-date-chip">Created {formatDate(service.createdAt)}</span>
                </div>

                {isEditing ? (
                  <div className="manage-edit-grid">
                    <label className="create-field">
                      <span>Title</span>
                      <input
                        value={editForm.title}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, title: event.target.value }))
                        }
                      />
                    </label>

                    <label className="create-field">
                      <span>Category</span>
                      <input
                        value={editForm.category}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, category: event.target.value }))
                        }
                      />
                    </label>

                    <label className="create-field create-price-field">
                      <span>Price</span>
                      <input
                        type="number"
                        min="1"
                        value={editForm.price}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, price: event.target.value }))
                        }
                      />
                    </label>

                    <label className="create-field">
                      <span>Description</span>
                      <textarea
                        rows={4}
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm((prev) => ({ ...prev, description: event.target.value }))
                        }
                      />
                    </label>

                    <div className="manage-actions-row">
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={isBusy}
                        onClick={() => submitEdit(service.id)}
                      >
                        {isBusy ? "Saving..." : "Save"}
                      </button>
                      <button type="button" className="btn-outline" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="service-category">{service.category}</p>
                    <h3>{service.title}</h3>
                    <p className="service-seller">{service.description}</p>

                    <div className="service-footer">
                      <span>Starting at</span>
                      <strong>{"\u20B9"}{service.price}</strong>
                    </div>

                    <div className="manage-actions-row">
                      <button
                        type="button"
                        className="btn-outline"
                        disabled={isBusy}
                        onClick={() => startEdit(service)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn-outline"
                        disabled={isBusy}
                        onClick={() => handleToggleStatus(service.id, service.isActive)}
                      >
                        {service.isActive ? "Pause" : "Activate"}
                      </button>

                      <button
                        type="button"
                        className="manage-delete-btn"
                        disabled={isBusy}
                        onClick={() => handleDelete(service.id, service.title)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

const OverviewPanel = ({
  loading,
  services,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
}: {
  loading: boolean;
  services: Service[];
  error: string;
  onCreate: () => void;
  onUpdate: (serviceId: number, payload: ServiceEditForm) => Promise<void>;
  onDelete: (serviceId: number) => Promise<void>;
  onToggleStatus: (serviceId: number, isActive: boolean) => Promise<void>;
}) => {
  return (
    <div className="overview-shell">
      <section className="overview-hero-card">
        <div>
          <p className="overview-kicker">Seller Command Center</p>
          <h2>Build services, publish them, and manage them in one place.</h2>
          <p>
            Listings are real. Updates here directly control what buyers can see.
          </p>
        </div>

        <div className="overview-actions">
          <button type="button" className="btn-primary" onClick={onCreate}>
            + New Service
          </button>
        </div>
      </section>

      <MyServicesManagement
        loading={loading}
        services={services}
        error={error}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
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

  useEffect(() => {
    loadMyServices();
  }, []);

  const handleUpdateService = async (serviceId: number, payload: ServiceEditForm) => {
    const updated = await updateMyService(serviceId, {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      price: Number(payload.price),
    });

    setMyServices((current) =>
      current.map((service) => (service.id === serviceId ? updated : service))
    );
  };

  const handleDeleteService = async (serviceId: number) => {
    await deleteMyService(serviceId);
    setMyServices((current) => current.filter((service) => service.id !== serviceId));
  };

  const handleToggleServiceStatus = async (serviceId: number, isActive: boolean) => {
    const updated = await updateMyServiceStatus(serviceId, isActive);

    setMyServices((current) =>
      current.map((service) => (service.id === serviceId ? updated : service))
    );
  };

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
            onUpdate={handleUpdateService}
            onDelete={handleDeleteService}
            onToggleStatus={handleToggleServiceStatus}
          />
        );
      case "services":
        return (
          <MyServicesManagement
            loading={loadingMyServices}
            services={myServices}
            error={myServicesError}
            onCreate={() => handleViewChange("create")}
            onUpdate={handleUpdateService}
            onDelete={handleDeleteService}
            onToggleStatus={handleToggleServiceStatus}
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
