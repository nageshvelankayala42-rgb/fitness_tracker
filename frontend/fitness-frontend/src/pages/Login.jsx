```jsx
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://fitness-tracker-backend-j7zh.onrender.com/api/users/login",
        {
          email,
          password,
        }
      );

      login(response.data);
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage("Invalid email or password");
      } else if (error.response?.status === 404) {
        setErrorMessage("Login endpoint not found. Please check the backend API.");
      } else {
        setErrorMessage(
          "Unable to connect to the server. Please try again."
        );
      }

      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-visual">
          <div className="brand-row">
            <div className="brand-mark">F</div>
            <span>Fitness Tracker</span>
          </div>

          <div className="visual-copy">
            <h2>Train harder. Recover smarter.</h2>
            <p>
              Track your workouts, monitor progress, and stay consistent with
              every rep, run, and recovery session.
            </p>

            <div className="metric-row">
              <div className="metric">
                <strong>12k+</strong>
                <span>Members</span>
              </div>

              <div className="metric">
                <strong>94%</strong>
                <span>Retention</span>
              </div>

              <div className="metric">
                <strong>24/7</strong>
                <span>Support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-panel">
          <div className="login-card">
            <div className="login-header">
              <span>Welcome back</span>
              <h1>Sign in</h1>
              <p>Access your training dashboard and fitness goals.</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {errorMessage && (
                <p role="alert" className="login-error">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="form-footer">
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
```
