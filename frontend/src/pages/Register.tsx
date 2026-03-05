import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../utils/api";
import logo from "../assets/logo.png";
import { isAdminAccount, isAuthenticated } from "../utils/auth";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(isAdminAccount() ? "/admin" : "/dashboard", { replace: true });
    }
  }, [navigate]);

  const validatePassword = (value: string) => {
    if (value.length < 8)
      return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(value))
      return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(value))
      return "Password must contain a number";
    if (!/[^A-Za-z0-9]/.test(value))
      return "Password must contain a special character";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const pwdError = validatePassword(password);
    if (pwdError) return setError(pwdError);
    if (password !== confirmPassword)
      return setError("Passwords do not match");

    try {
      const data = await registerUser({ name, email, password });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="register-shell">
        <aside className="register-showcase">
          <div className="auth-logo register-logo">
            <Link to="/">
              <img src={logo} alt="Taskara" />
            </Link>
          </div>

          <p className="register-kicker">For Freelancers and Clients</p>
          <h2>Start building with a marketplace that feels enterprise-ready.</h2>
          <p>
            Launch services, connect with quality buyers, and manage delivery with
            a workflow built for serious growth.
          </p>

          <ul className="register-benefits">
            <li>
              <strong>Professional storefront</strong>
              <span>Create high-converting listings with structured service details.</span>
            </li>
            <li>
              <strong>Secure collaboration</strong>
              <span>Manage communication, updates, and delivery in one workspace.</span>
            </li>
            <li>
              <strong>Scalable growth tools</strong>
              <span>Use seller dashboard insights to optimize your offerings.</span>
            </li>
          </ul>
        </aside>

        <div className="auth-box register-auth-box">
          <h2 className="auth-title">Create Your Account</h2>
          <p className="auth-subtitle">
            Join Taskara and start offering or hiring services
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
              {error && <p className="password-error">{error}</p>}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="password-error">Passwords do not match</p>
              )}
            </div>

            <button className="auth-btn">Create Account</button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
