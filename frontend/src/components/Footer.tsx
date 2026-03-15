import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const footerColumns = [
  {
    title: "Categories",
    items: [
      { label: "Programming & Tech", to: "/abouts/programming-and-tech" },
      { label: "Graphics & Design", to: "/abouts/graphics-and-design" },
      { label: "Digital Marketing", to: "/abouts/digital-marketing" },
      { label: "Writing & Translation", to: "/abouts/writing-and-translation" },
      { label: "Video & Animation", to: "/abouts/video-and-animation" },
      { label: "Business", to: "/abouts/business" },
    ],
  },
  {
    title: "For Clients",
    items: [
      { label: "How Taskara Works", to: "/abouts/how-taskara-works" },
      { label: "Quality Guide", to: "/abouts/quality-guide" },
      { label: "Project Briefs", to: "/abouts/project-briefs" },
      { label: "Hiring Support", to: "/abouts/hiring-support" },
      { label: "Enterprise Solutions", to: "/abouts/enterprise-solutions" },
      { label: "Trust & Safety", to: "/abouts/trust-and-safety" },
    ],
  },
  {
    title: "For Sellers",
    items: [
      { label: "Become a Seller", to: "/abouts/become-a-seller" },
      { label: "Seller Handbook", to: "/abouts/seller-handbook" },
      { label: "Community Hub", to: "/abouts/community-hub" },
      { label: "Seller Success Stories", to: "/abouts/seller-success-stories" },
      { label: "Service Catalog Tips", to: "/abouts/service-catalog-tips" },
      { label: "Affiliate Program", to: "/abouts/affiliate-program" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", to: "/abouts/about" },
      { label: "Careers", to: "/abouts/careers" },
      { label: "Terms of Service", to: "/abouts/terms-of-service" },
      { label: "Privacy Policy", to: "/abouts/privacy-policy" },
      { label: "Press & News", to: "/abouts/press-and-news" },
      { label: "Contact", to: "/abouts/contact" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer-top">
        {footerColumns.map((column) => (
          <div key={column.title} className="footer-column">
            <h4>{column.title}</h4>
            <ul>
              {column.items.map((item) => (
                <li key={typeof item === "string" ? item : item.label}>
                  {typeof item === "string" ? (
                    <a href="#" onClick={(event) => event.preventDefault()}>
                      {item}
                    </a>
                  ) : (
                    <Link to={item.to}>{item.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="site-footer-bottom">
        <div className="footer-brand-row">
          <Link to="/" className="footer-brand-link">
            <img src={logo} alt="Taskara" className="footer-logo" />
          </Link>
          <span className="footer-copy">Copyright Taskara 2026</span>
        </div>

        <div className="footer-meta">
          <span>English</span>
          <span>INR</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
