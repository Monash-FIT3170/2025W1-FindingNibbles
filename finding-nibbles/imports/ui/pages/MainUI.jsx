import React from "react";
import { useNavigate } from "react-router-dom";

import { MapScreen } from "../components/MapScreen"; // Make sure this path is correct

export const MainUI = () => {
    const navigate = useNavigate();
    console.log("App is rendering");
    const login = true; // Change to false to see MapScreen
    return (
        <div className="app">
            {login ? (
                <>
                    <div>
                        <h1>Finding Nibbles</h1>
                    </div>
                    <header className="header">
                        <div className="logo">
                            {/* Replace this with an actual icon if you have one */}
                            <img
                                src="/images/bunnyIcon.png"
                                alt="bunny icon"
                                className="bunny-icon"
                            />
                            FindingNibbles
                        </div>
                        <button
                            className="account-button"
                            onClick={() => navigate("/register")}
                        >
                            Account
                        </button>
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
