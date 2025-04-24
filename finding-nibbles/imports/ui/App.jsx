import React from 'react';
import MapScreen from './MapScreen'; // Make sure this path is correct

export const App = () => {
  const login = false; // Change to false to see MapScreen

  return (
    <div className="app">
      {login ? (
        <>
          <header className="header">
            <div className="logo">
              {/* Replace this with an actual icon if you have one */}
              <img src="/images/bunny-icon.png" alt="bunny icon" className="bunny-icon" />
              FindingNibbles
            </div>
            <button className="account-button">Account</button>
          </header>

          <div className="main-content">
            <div className="background-image">
              <div className="location-box">
                <h2>What can we eat today...?</h2>
                <input
                  type="text"
                  className="location-input"
                  placeholder="Enter your location"
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <MapScreen />
      )}
    </div>
  );
};
