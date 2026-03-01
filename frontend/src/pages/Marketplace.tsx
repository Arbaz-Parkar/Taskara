import "../index.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchServices } from "../utils/api";

type Service = {
  id: number;
  title: string;
  category: string;
  price: number;
  seller: {
    name: string;
  };
};

const Marketplace = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServices();
        setServices(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  if (loading) {
    return <div className="dashboard-content">Loading services...</div>;
  }

  return (
    <div className="marketplace-container">
      <h2 className="marketplace-title">Explore Services</h2>

      <div className="marketplace-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className="service-market-card"
            onClick={() => navigate(`/service/${service.id}`)}
          >
            <div className="service-image-placeholder" />

            <div className="service-info">
              <p className="service-category">{service.category}</p>

              <h3>{service.title}</h3>

              <p className="service-seller">
                by <strong>{service.seller.name}</strong>
              </p>

              <div className="service-footer">
                <span>Starting at</span>
                <strong>₹{service.price}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;