import React from 'react';
import DicePopup from './popups/DicePopup';
import { NavBar } from './layouts/NavBar';

export const MapScreen = () => {
    return (
      <div className="map-container">
        <NavBar/>
        <div className="top-bar">
          <img src="/images/bunnyIcon.png" alt="logo" className="logo" />
          <h1 className="title">FindingNibbles</h1>
        </div>

      </div>
    );
  };
  