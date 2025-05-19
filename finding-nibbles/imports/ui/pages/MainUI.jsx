import React from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "../components/layouts/NavBar";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

export const MainUI = () => {
  const navigate = useNavigate();
  console.log("App is rendering");
  const login = false; // Change to false to see MapScreen

  return (
    <div className="app">
      {login ? (
        <>
          <div className="main-content">
            <div className="background-image"></div>
          </div>
        </>
      ) : (
        <div className="map-container">
          <NavBar />
          <div className="top-bar">
            <img src="/images/bunnyIcon.png" alt="logo" className="logo" />
            <h1 className="title">FindingNibbles</h1>
          </div>
        </div>
      )}
    </div>
  );
};
