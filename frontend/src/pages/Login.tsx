import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../utils/api";
import { isAdminAccount, isAuthenticated, setAuthIdentity } from "../utils/auth";
import logo from "../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(isAdminAccount() ? "/admin" : "/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("token", data.token);
      setAuthIdentity(data.user?.email, data.user?.role);
      navigate(isAdminAccount() ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  if (isAuthenticated()) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="login-shell">
        <aside className="login-showcase">
          <div className="auth-logo login-logo">
            <Link to="/">
              <img src={logo} alt="Taskara" />
            </Link>
          </div>

          <p className="login-kicker">Welcome back to Taskara</p>
          <h2>Sign in and continue managing your marketplace workflow.</h2>
          <p>
            Access your dashboard, respond to buyers, and manage active listings
            from one professional workspace.
          </p>

          <ul className="login-benefits">
            <li>
              <strong>Listings control</strong>
              <span>Edit pricing, pause offers, or publish new services instantly.</span>
            </li>
            <li>
              <strong>Faster fulfillment</strong>
              <span>Track service updates and keep buyer communication organized.</span>
            </li>
            <li>
              <strong>Consistent growth</strong>
              <span>Maintain a credible storefront with a high response experience.</span>
            </li>
          </ul>
        </aside>

        <div className="auth-box login-auth-box">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Login to continue using Taskara</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
            </div>

            {error && <p className="password-error">{error}</p>}

            <button className="auth-btn">Login</button>
          </form>

          <p className="auth-footer">
            Do not have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
