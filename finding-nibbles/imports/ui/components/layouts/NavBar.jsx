import React from "react";
import { Link } from "react-router-dom";
import "../../styles/layouts.css";

const bunnyIcon = "/images/bunnyIcon.png";

export const NavBar = () => {
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
            <Link to="/">Logout</Link>
          </li>
        </ul>
      </nav>
    );
};
