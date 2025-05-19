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

    return (
        <Router>
            <NavBar />
            <RoutesConfig />
        </Router>
    );
};
