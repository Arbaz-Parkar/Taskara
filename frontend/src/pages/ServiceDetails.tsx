import { useParams } from "react-router-dom";
import "../index.css";

type Service = {
  id: number;
  title: string;
  seller: string;
  price: number;
  category: string;
  description: string;
};

const mockServices: Service[] = [
  {
    id: 1,
    title: "I will build a modern React website",
    seller: "ArjunDesigns",
    price: 2500,
    category: "Web Development",
    description:
      "I will create a modern, responsive and high-performance React website tailored to your business needs.",
  },
  {
    id: 2,
    title: "Professional logo design for your brand",
    seller: "PixelStudio",
    price: 1200,
    category: "Graphic Design",
    description:
      "Get a clean, memorable and professional logo designed specifically for your brand identity.",
  },
  {
    id: 3,
    title: "SEO optimization for your business",
    seller: "GrowthExpert",
    price: 1800,
    category: "Marketing",
    description:
      "Improve your rankings with advanced SEO optimization and keyword research.",
  },
];

const ServiceDetails = () => {
  const { id } = useParams();

  // ✅ Use the route id
  const service = mockServices.find(
    (s) => s.id === Number(id)
  );

  if (!service) {
    return <div className="dashboard-content">Service not found.</div>;
  }

  return (
    <div className="service-details-container">
      <div className="service-details-grid">
        {/* LEFT SIDE */}
        <div className="service-main">
          <h1>{service.title}</h1>

          <div className="seller-row">
            <strong>{service.seller}</strong>
            <span className="rating">⭐ 4.9 (128 reviews)</span>
          </div>

          <div className="service-gallery" />

          <section className="service-section">
            <h3>About This Service</h3>
            <p>{service.description}</p>
          </section>

          <section className="service-section">
            <h3>What You'll Get</h3>
            <ul className="feature-list">
              <li>✓ Responsive Design</li>
              <li>✓ Modern UI/UX</li>
              <li>✓ SEO Optimized</li>
              <li>✓ Source Code Included</li>
            </ul>
          </section>
        </div>

        {/* RIGHT SIDE */}
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