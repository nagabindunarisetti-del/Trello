import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = (e) => {

    e.preventDefault();

    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);

    // Temporary navigation
    navigate("/");
  };

  return (
    <div className="auth-container">

      <div className="auth-box">

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Create your Kanban account
        </p>

        <form onSubmit={handleRegister}>

          <label>Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Register
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Register;