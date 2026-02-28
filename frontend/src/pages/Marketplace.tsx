import "../index.css";
import { useNavigate } from "react-router-dom";

type Service = {
  id: number;
  title: string;
  seller: string;
  price: number;
  category: string;
};

const mockServices: Service[] = [
  {
    id: 1,
    title: "I will build a modern React website",
    seller: "ArjunDesigns",
    price: 2500,
    category: "Web Development",
  },
  {
    id: 2,
    title: "Professional logo design for your brand",
    seller: "PixelStudio",
    price: 1200,
    category: "Graphic Design",
  },
  {
    id: 3,
    title: "SEO optimization for your business",
    seller: "GrowthExpert",
    price: 1800,
    category: "Marketing",
  },
  {
    id: 4,
    title: "Mobile app development (Android & iOS)",
    seller: "CodeCraft",
    price: 6000,
    category: "App Development",
  },
  {
    id: 5,
    title: "High-quality video editing",
    seller: "EditPro",
    price: 1500,
    category: "Video Editing",
  },
  {
    id: 6,
    title: "Content writing for blogs & websites",
    seller: "WriteFlow",
    price: 900,
    category: "Writing",
  },
];

const Marketplace = () => {
  const navigate = useNavigate();

  return (
    <div className="marketplace-container">
      <h2 className="marketplace-title">Explore Services</h2>

      <div className="marketplace-grid">
        {mockServices.map((service) => (
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
                by <strong>{service.seller}</strong>
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