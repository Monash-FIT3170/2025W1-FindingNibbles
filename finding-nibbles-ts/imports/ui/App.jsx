import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
} from "react-router-dom";

import { RoutesConfig } from "./routes/RoutesConfig";
import { NavBar } from "./components/layouts/NavBar";

export const App = () => {
    const login = true; // Change to false to see MapScreen

    return (
        <Router>
            <NavBar />
            <RoutesConfig />
        </Router>
    );
};
