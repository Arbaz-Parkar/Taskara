import "../index.css";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { isAdminAccount, isAuthenticated } from "../utils/auth";

const popularCategories = [
  "Website Development",
  "UI/UX Design",
  "Social Media Marketing",
  "Video Editing",
  "AI Automation",
  "Business Consulting",
  "Mobile App Development",
  "Content Writing",
];

const platformHighlights = [
  {
    title: "Verified Talent",
    description: "Work with trusted professionals across high-demand categories.",
  },
  {
    title: "Fast Matching",
    description: "Post your requirement and get relevant proposals quickly.",
  },
  {
    title: "Secure Workflow",
    description: "Manage communication, milestones, and delivery in one place.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(isAdminAccount() ? "/admin" : "/dashboard", { replace: true });
    }
  }, [navigate]);

  if (isAuthenticated()) {
    return null;
  }

  return (
    <div className="home-shell">
      <header className="navbar home-navbar">
        <div className="nav-container">
          <img src={logo} alt="Taskara" className="logo" />

          <div className="nav-actions">
            <Link to="/login" className="btn-outline">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-kicker">India's modern service marketplace</p>
          <h1>Hire premium freelancers or grow your own service business.</h1>
          <p>
            Taskara helps clients discover top talent and helps providers build
            consistent income with a professional storefront.
          </p>

          <div className="hero-buttons home-hero-actions">
            <Link to="/register" className="btn-primary">
              Find Talent
            </Link>
            <Link to="/register" className="btn-outline">
              Become a Seller
            </Link>
          </div>

          <div className="home-trust-row">
            <span>Trusted by teams in design, engineering, marketing, and ops.</span>
          </div>
        </div>

        <div className="home-hero-card">
          <h3>Live Marketplace Momentum</h3>
          <div className="home-hero-metric-grid">
            <article>
              <strong>12K+</strong>
              <span>Services listed</span>
            </article>
            <article>
              <strong>4.8/5</strong>
              <span>Average buyer rating</span>
            </article>
            <article>
              <strong>24h</strong>
              <span>Typical first response</span>
            </article>
            <article>
              <strong>90+</strong>
              <span>Specialized categories</span>
            </article>
          </div>
        </div>
      </section>

      <section className="home-highlight-grid">
        {platformHighlights.map((item) => (
          <article key={item.title} className="home-highlight-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="home-categories">
        <div className="home-section-head">
          <h2>Popular Categories</h2>
          <p>Discover top-performing service verticals on Taskara.</p>
        </div>

        <div className="home-category-grid">
          {popularCategories.map((category) => (
            <div key={category} className="home-category-card">
              {category}
            </div>
          ))}
        </div>
      </section>

      <section className="home-cta-band">
        <h2>Ready to scale with Taskara?</h2>
        <p>Create an account and start buying or selling services today.</p>
        <Link to="/register" className="btn-primary">
          Create Free Account
        </Link>
      </section>
    </div>
  );
}
