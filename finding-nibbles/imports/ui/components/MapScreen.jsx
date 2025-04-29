import React from 'react';
import DicePopup from './popups/DicePopup';

export const MapScreen = () => {
    return (
      <div className="map-container">
        <div className="top-bar">
          <img src="/images/bunnyIcon.png" alt="logo" className="logo" />
          <h1 className="title">FindingNibbles</h1>
          <div className="user-section">
            <span>Hi, user!</span>
            <img src="/images/user-icon.png" alt="user" className="user-icon" />
          </div>
        </div>
  
        <div className="map-content">
          <div className="filters">
            <input placeholder="Enter your location" className="location-input" />
            <select className="dropdown">
              <option>Vegetarian</option>
              <option>Vegan</option>
              <option>Halal</option>
            </select>
            <select className="dropdown">
              <option>None</option>
              <option>Birthday</option>
              <option>Date</option>
            </select>
          </div>
          <img src="/images/map-placeholder.png" alt="map" className="map-image" />
        </div>
  
        <div className="side-menu">
          <button className="menu-button active">Map</button>
          <DicePopup/>
          <button className="menu-button">AI suggestion</button>
          <button className="menu-button">Travel Plan</button>
          <button className="menu-button">Meal Plan</button>
          <button className="menu-button logout">Logout</button>
        </div>
      </div>
    );
  };
  