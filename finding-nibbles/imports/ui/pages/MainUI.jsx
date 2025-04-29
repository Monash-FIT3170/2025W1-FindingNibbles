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
