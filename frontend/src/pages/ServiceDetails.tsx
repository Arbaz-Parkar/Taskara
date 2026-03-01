import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchServiceById } from "../utils/api";
import "../index.css";

type Service = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  seller: {
    name: string;
  };
};

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    const loadService = async () => {
      if (!id) return;

      const data = await fetchServiceById(id);
      setService(data);
    };

    loadService();
  }, [id]);

  if (!service) {
    return <div className="dashboard-content">Loading...</div>;
  }

  return (
    <div className="service-details-container">
      <div className="service-details-grid">
        {/* LEFT */}
        <div className="service-main">
          <h1>{service.title}</h1>

          <div className="seller-row">
            <strong>{service.seller.name}</strong>
            <span className="rating">⭐ 5.0</span>
          </div>

          <div className="service-gallery" />

          <section className="service-section">
            <h3>About This Service</h3>
            <p>{service.description}</p>
          </section>
        </div>

        {/* RIGHT */}
        <aside className="service-sidebar">
          <h3>Standard Package</h3>

          <div className="price">₹{service.price}</div>

          <p className="delivery">3 Days Delivery</p>

          <button className="btn-primary order-btn">
            Continue to Order
          </button>

          <button className="btn-outline contact-btn">
            Contact Seller
          </button>
        </aside>
      </div>
    </div>
  );
};

export default ServiceDetails;