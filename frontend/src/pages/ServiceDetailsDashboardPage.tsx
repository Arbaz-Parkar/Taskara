import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMyServices, updateMyServiceStatus } from "../utils/api";
import DashboardShell from "../components/DashboardShell";

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

const ServiceDetailsDashboardPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const allServices = await fetchMyServices();
        const found = allServices.find((item: Service) => String(item.id) === serviceId);

        if (!found) {
          setError("Service not found");
          return;
        }

        setService(found);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load service");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [serviceId]);

  const toggleStatus = async () => {
    if (!service) {
      return;
    }

    try {
      setUpdatingStatus(true);
      const updated = await updateMyServiceStatus(service.id, !service.isActive);
      setService(updated);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update service status");
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <DashboardShell>
      {loading ? (
        <div className="dashboard-placeholder">Loading service...</div>
      ) : error ? (
        <div className="dashboard-placeholder">
          <h2>Could not load service</h2>
          <p>{error}</p>
          <button className="btn-outline" onClick={() => navigate("/dashboard/services")}>Back to Listings</button>
        </div>
      ) : service ? (
        <section className="overview-market-section">
          <div className="manage-head-row">
            <div className="overview-market-head">
              <h3>{service.title}</h3>
              <p>{service.category}</p>
            </div>

            <div className="manage-actions-row">
              <button className="btn-outline" onClick={() => navigate("/dashboard/services")}>Back</button>
              <button className="btn-outline" onClick={() => navigate(`/dashboard/services/${service.id}/edit`)}>Edit</button>
              <button className="btn-primary" onClick={toggleStatus} disabled={updatingStatus}>
                {updatingStatus ? "Updating..." : service.isActive ? "Pause Service" : "Activate Service"}
              </button>
            </div>
          </div>

          <div className="dashboard-placeholder compact-placeholder">
            <p><strong>Status:</strong> {service.isActive ? "Active" : "Paused"}</p>
            <p><strong>Created:</strong> {formatDate(service.createdAt)}</p>
            <p><strong>Price:</strong> {`\u20B9${service.price}`}</p>
            <p><strong>Description:</strong> {service.description}</p>
          </div>
        </section>
      ) : null}
    </DashboardShell>
  );
};

export default ServiceDetailsDashboardPage;
