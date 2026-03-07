import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createOrder, fetchServiceById } from "../utils/api";
import { isAuthenticated } from "../utils/auth";
import "../index.css";

type Service = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  seller: {
    id: number;
    name: string;
  };
  images?: {
    id: number;
    fileUrl: string;
    sortOrder: number;
  }[];
};

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [requirements, setRequirements] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    const loadService = async () => {
      if (!id) return;

      const data = await fetchServiceById(id);
      setService(data);
    };

    loadService();
  }, [id]);

  const handlePlaceOrder = async () => {
    if (!service) {
      return;
    }

    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    try {
      setPlacingOrder(true);
      setOrderError("");
      setOrderMessage("");

      await createOrder({
        serviceId: service.id,
        requirements: requirements.trim() || undefined,
      });

      setOrderMessage("Order placed successfully. Redirecting to Orders...");
      navigate("/dashboard/orders", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setOrderError(err.message);
      } else {
        setOrderError("Failed to place order");
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!service) {
    return <div className="dashboard-content">Loading...</div>;
  }

  return (
    <div className="service-details-container">
      <div className="service-details-grid">
        <div className="service-main">
          <h1>{service.title}</h1>

          <div className="seller-row">
            <Link to={`/profile/${service.seller.id}`} className="profile-inline-link">
              <strong>{service.seller.name}</strong>
            </Link>
            <span className="rating">5.0</span>
          </div>

          {service.images?.[0]?.fileUrl ? (
            <img src={service.images[0].fileUrl} alt={service.title} className="service-gallery-image" />
          ) : (
            <div className="service-gallery" />
          )}

          <section className="service-section">
            <h3>About This Service</h3>
            <p>{service.description}</p>
          </section>
        </div>

        <aside className="service-sidebar">
          <h3>Standard Package</h3>

          <div className="price">{"\u20B9"}{service.price}</div>

          <p className="delivery">3 Days Delivery</p>

          <label className="create-field order-requirements-field">
            <span>Order Notes (Optional)</span>
            <textarea
              rows={4}
              placeholder="Share your requirements to help the seller get started."
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
            />
          </label>

          {orderError && <p className="form-status form-status-error">{orderError}</p>}
          {orderMessage && <p className="form-status form-status-success">{orderMessage}</p>}

          <button
            className="btn-primary order-btn"
            onClick={handlePlaceOrder}
            disabled={placingOrder}
          >
            {placingOrder ? "Placing Order..." : "Continue to Order"}
          </button>

          <button
            className="btn-outline contact-btn"
            onClick={() => navigate(`/profile/${service.seller.id}`)}
          >
            Contact Seller
          </button>
        </aside>
      </div>
    </div>
  );
};

export default ServiceDetails;
