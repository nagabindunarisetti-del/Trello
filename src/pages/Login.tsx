import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../components/AuthContext";

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Where to go after login (the page they tried to open, or dashboard)
  const redirectTo =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname || "/dashboard";

  // Already logged in? Skip the login page.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>TaskFlow</h1>

        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={handleLogin}>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <label htmlFor="login-email">Email</label>

          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
