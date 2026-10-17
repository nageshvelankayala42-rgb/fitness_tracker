import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
    setErrorMessage("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axios.post("http://localhost:8080/api/users", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setSuccessMessage("Account created successfully. Please sign in.");
      setTimeout(() => navigate("/login"), 900);
    } catch (error) {
      if (error.response?.status === 400) {
        setErrorMessage("Please check your registration details.");
      } else if (error.response?.status === 409) {
        setErrorMessage("An account with this email already exists.");
      } else if (error.response?.status >= 500) {
        setErrorMessage("The server is unavailable right now. Please try again later.");
      } else {
        setErrorMessage("Unable to connect to the server. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-shell">
        <div className="register-visual">
          <div className="brand-row">
            <div className="brand-mark">F</div>
            <span>Fitness Tracker</span>
          </div>

          <div className="visual-copy">
            <h2>Build strength. Own your routine.</h2>
            <p>
              Create your account to start tracking workouts, staying accountable, and
              hitting your fitness goals with confidence.
            </p>

            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-dot"></span>
                <span>Personalized training plans</span>
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <span>Progress insights and milestones</span>
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <span>Workout consistency tracking</span>
              </div>
            </div>
          </div>
        </div>

        <div className="register-panel">
          <div className="register-card">
            <div className="register-header">
              <span>New account</span>
              <h1>Create Account</h1>
              <p>Join the next step in your performance journey.</p>
            </div>

            <form className="register-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label htmlFor="fullName">Full Name</label>
                <input id="fullName" name="name" type="text" placeholder="John Smith" value={form.name} onChange={handleChange} />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" placeholder="Create a password" value={form.password} onChange={handleChange} />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="field-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} />
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>

              {errorMessage && <p className="register-message error" role="alert">{errorMessage}</p>}
              {successMessage && <p className="register-message success" role="status">{successMessage}</p>}

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="form-footer">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
