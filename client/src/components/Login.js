import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import axios from "axios";
import "./Auth.css";
import ToastMessage from "./ToastMessage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/users/login", {
        username,
        password,
      });
      toast("Login success");
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
      history.push("/documents");
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      toast.error("Login failed",error.response?.data || error.message);
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="login-container">
      <ToastContainer />
      <div className="login-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p>Made by : Abhishek Sharma</p>
      </div>
    </div>
  );
}

export default Login;
