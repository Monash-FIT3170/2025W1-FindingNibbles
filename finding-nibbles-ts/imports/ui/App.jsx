import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
} from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { RoutesConfig } from "./routes/RoutesConfig";
import { NavBar } from "./components/layouts/NavBar";
import { theme } from "./styling/theme";

export const App = () => {
    const login = true; // Change to false to see MapScreen test
    const isLoggedIn = useTracker(() => !!Meteor.userId(), []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <NavBar />
                <RoutesConfig isLoggedIn={isLoggedIn} />
            </Router>
             <ToastContainer
                position="top-center"
                autoClose={2000}
                closeOnClick
                pauseOnHover
            />
        </ThemeProvider>
    );
};
