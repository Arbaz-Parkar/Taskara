import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMyServices, updateMyService } from "../utils/api";
import DashboardShell from "../components/DashboardShell";

type Service = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
};

const ServiceEditDashboardPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

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
        setTitle(found.title);
        setCategory(found.category);
        setPrice(String(found.price));
        setDescription(found.description);
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!service) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateMyService(service.id, {
        title,
        category,
        description,
        price: Number(price),
      });

      navigate(`/dashboard/services/${service.id}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update service");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell>
      {loading ? (
        <div className="dashboard-placeholder">Loading service...</div>
      ) : error && !service ? (
        <div className="dashboard-placeholder">
          <h2>Could not load service</h2>
          <p>{error}</p>
          <button className="btn-outline" onClick={() => navigate("/dashboard/services")}>Back to Listings</button>
        </div>
      ) : service ? (
        <section className="overview-market-section">
          <div className="manage-head-row">
            <div className="overview-market-head">
              <h3>Edit Service</h3>
              <p>Update listing details for {service.title}</p>
            </div>

            <button className="btn-outline" onClick={() => navigate(`/dashboard/services/${service.id}`)}>
              Back to Service
            </button>
          </div>

          <form className="create-service-form" onSubmit={handleSubmit}>
            <label className="create-field">
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>

            <label className="create-field">
              <span>Category</span>
              <input value={category} onChange={(event) => setCategory(event.target.value)} required />
            </label>

            <label className="create-field create-price-field">
              <span>Price</span>
              <input
                type="number"
                min="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
            </label>

            <label className="create-field">
              <span>Description</span>
              <textarea
                rows={6}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </label>

            {error && <p className="form-status form-status-error">{error}</p>}

            <button className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
      ) : null}
    </DashboardShell>
  );
};

export default ServiceEditDashboardPage;
