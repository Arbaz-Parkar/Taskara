import "../index.css";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-container">
          <img src={logo} alt="Taskara" className="logo" />

          <div className="nav-actions">
            <Link to="/login" className="btn-outline">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>
          Find Skilled Professionals <br /> for Any Task
        </h1>
        <p>
          Taskara connects you with trusted professionals for work,
          services, and projects — fast and secure.
        </p>

        <div className="hero-buttons">
          <Link to="/register" className="btn-primary">
            Get Started
          </Link>
          <Link to="/register" className="btn-outline">
            Become a Provider
          </Link>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services">
        <h2>Popular Services</h2>

        <div className="service-grid">
          <div className="service-card">Web Development</div>
          <div className="service-card">Graphic Design</div>
          <div className="service-card">Video Editing</div>
          <div className="service-card">Digital Marketing</div>

          <div className="service-card">Content Writing</div>
          <div className="service-card">Mobile App Development</div>
          <div className="service-card">Food & Catering</div>
          <div className="service-card">Home Renovating</div>
        </div>
      </section>
    </>
  );
}
