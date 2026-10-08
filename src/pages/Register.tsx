import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../components/AuthContext";

function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password); // also logs the user in
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Create Account</h1>

        <p className="auth-subtitle">Create your TaskFlow account</p>

        <form onSubmit={handleRegister}>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <label htmlFor="reg-name">Name</label>

          <input
            id="reg-name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />

          <label htmlFor="reg-email">Email</label>

          <input
            id="reg-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="reg-password">Password</label>

          <input
            id="reg-password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />

          <label htmlFor="reg-confirm">Confirm password</label>

          <input
            id="reg-confirm"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
