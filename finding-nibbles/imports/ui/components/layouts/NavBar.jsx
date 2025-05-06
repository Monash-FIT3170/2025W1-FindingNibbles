import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import "../../styles/layouts.css";
const bunnyIcon = "/images/bunnyIcon.png";

export const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Meteor.logout((err) => {
      if (err) {
        console.error("Logout failed:", err);
      } else {
        console.log("Logged out successfully");
        navigate("/login");
      }
    });
  };

  return (
    <nav className="nav-bar">
      <div className="nav-logo">
        <Link to="/" className="nav-home-link">
          <img src={bunnyIcon} alt="Bunny Icon" className="nav-icon" />
          <span>Finding Nibbles</span>
        </Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/register">Register</Link>
        </li>
        <li>
          <Link to="/map">Map</Link>
        </li>
        <li>
          <Link to="/">AI suggestion</Link>
        </li>
        <li>
          <Link to="/">Travel Plan</Link>
        </li>
        <li>
          <Link to="/">Meal Plan</Link>
        </li>
        <li>
          <button className="nav-link-button" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};
