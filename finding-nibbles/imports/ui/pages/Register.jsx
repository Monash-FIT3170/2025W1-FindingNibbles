import React, { useState } from "react";
import { FormField } from "../components/forms/FormField";
import { Meteor } from "meteor/meteor";
import { useNavigate } from "react-router-dom"; // For navigation after registration

export const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState(""); // For error handling
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    // Call the Meteor method to register the user
    Meteor.call(
      "users.register",
      formData.username,
      formData.email,
      formData.password,
      (err, res) => {
        if (err) {
          setError(err.reason || "An error occurred during registration");
        } else {
          console.log("Registration successful!");
          navigate("/"); // Navigate to home page or login page after successful registration
        }
      }
    );
  };

  return (
    <div className="register-container">
      <h1 className="register-title">Welcome to Finding Nibbles!</h1>
      {error && <p className="error-message">{error}</p>}
      <form className="register-form" onSubmit={handleSubmit}>
        <FormField
          label="Username"
          type="text"
          name="username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
        />
        <FormField
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />
        <FormField
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />
        <FormField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        <button type="submit" className="register-button">
          Register
        </button>
      </form>
    </div>
  );
};
