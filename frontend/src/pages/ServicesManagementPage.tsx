import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteMyService,
  fetchMyServices,
  updateMyServiceStatus,
} from "../utils/api";

type Service = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  isActive: boolean;
  createdAt: string;
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ServicesManagementPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [busyServiceId, setBusyServiceId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchMyServices();
        setServices(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load your listings");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

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

  const handleToggleStatus = async (serviceId: number, currentStatus: boolean) => {
    try {
      setBusyServiceId(serviceId);
      setActionError("");
      setActionSuccess("");

      const updated = await updateMyServiceStatus(serviceId, !currentStatus);
      setServices((current) =>
        current.map((service) => (service.id === serviceId ? updated : service))
      );
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

      await deleteMyService(serviceId);
      setServices((current) => current.filter((service) => service.id !== serviceId));
      setActionSuccess("Service deleted.");
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

  return (
    <section className="overview-market-section">
      <div className="manage-head-row">
        <div className="overview-market-head">
          <h3>My Services Management</h3>
          <p>Open, edit, pause, reactivate, and delete your listings.</p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate("/dashboard/services/new")}
        >
          + Create Service
        </button>
      </div>

      {loading ? (
        <div className="dashboard-placeholder">Loading your listings...</div>
      ) : error ? (
        <div className="dashboard-placeholder">
          <h2>Could not load your listings</h2>
          <p>{error}</p>
        </div>
      ) : (
        <>
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
                const isBusy = busyServiceId === service.id;

                return (
                  <article key={service.id} className="manage-service-card">
                    <div className="manage-service-header">
                      <span className={`manage-status-chip ${service.isActive ? "active" : "paused"}`}>
                        {service.isActive ? "Active" : "Paused"}
                      </span>
                      <span className="manage-date-chip">Created {formatDate(service.createdAt)}</span>
                    </div>

                    <p className="service-category">{service.category}</p>
                    <h3>{service.title}</h3>
                    <p className="service-seller">{service.description}</p>

                    <div className="service-footer">
                      <span>Starting at</span>
                      <strong>{`\u20B9${service.price}`}</strong>
                    </div>

                    <div className="manage-actions-row">
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => navigate(`/dashboard/services/${service.id}`)}
                      >
                        Open
                      </button>

                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => navigate(`/dashboard/services/${service.id}/edit`)}
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
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ServicesManagementPage;
