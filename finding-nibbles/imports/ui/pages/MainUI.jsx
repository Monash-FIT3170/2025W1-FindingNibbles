import React from "react";
import { useNavigate } from "react-router-dom";

import { MapScreen } from "../components/MapScreen"; // Make sure this path is correct

export const MainUI = () => {
    const navigate = useNavigate();
    console.log("App is rendering");
    const login = false; // Change to false to see MapScreen
    return (
        <div className="app">
            {login ? (
                <>
                    <div className="main-content">
                        <div className="background-image">
                        </div>
                    </div>
                </>
            ) : (
                <MapScreen />
            )}
        </div>
    );
};
