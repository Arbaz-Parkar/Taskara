import "../index.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchServices, resolveMediaUrl } from "../utils/api";

type Service = {
  id: number;
  title: string;
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
            {service.images?.[0]?.fileUrl ? (
              <img
                src={resolveMediaUrl(service.images[0].fileUrl) ?? service.images[0].fileUrl}
                alt={service.title}
                className="service-image-cover"
              />
            ) : (
              <div className="service-image-placeholder" />
            )}

            <div className="service-info">
              <p className="service-category">{service.category}</p>

              <h3>{service.title}</h3>

              <p className="service-seller">
                by{" "}
                <Link
                  to={`/profile/${service.seller.id}`}
                  className="profile-inline-link"
                  onClick={(event) => event.stopPropagation()}
                >
                  <strong>{service.seller.name}</strong>
                </Link>
              </p>

              <div className="service-footer">
                <span>Starting at</span>
                <strong>{`\u20B9${service.price}`}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
