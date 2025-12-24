import React, { use, useContext, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../websocket/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>CollabSync Login</h1>
      <input name="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
}
<p className="text-center mt-4">
        Don't have an account?{" "}
        <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/signup")}
        >
            Sign Up
        </span>
        </p>