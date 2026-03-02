import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const footerColumns = [
  {
    title: "Categories",
    items: [
      "Programming & Tech",
      "Graphics & Design",
      "Digital Marketing",
      "Writing & Translation",
      "Video & Animation",
      "Business",
    ],
  },
  {
    title: "For Clients",
    items: [
      "How Taskara Works",
      "Quality Guide",
      "Project Briefs",
      "Hiring Support",
      "Enterprise Solutions",
      "Trust & Safety",
    ],
  },
  {
    title: "For Sellers",
    items: [
      "Become a Seller",
      "Seller Handbook",
      "Community Hub",
      "Seller Success Stories",
      "Service Catalog Tips",
      "Affiliate Program",
    ],
  },
  {
    title: "Company",
    items: [
      "About",
      "Careers",
      "Terms of Service",
      "Privacy Policy",
      "Press & News",
      "Contact",
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
                <li key={item}>
                  <a href="#" onClick={(event) => event.preventDefault()}>
                    {item}
                  </a>
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
