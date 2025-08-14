import React from "react";
import {
    BrowserRouter as Router,
} from "react-router-dom";
import { useTracker } from 'meteor/react-meteor-data';

import { RoutesConfig } from "./routes/RoutesConfig";
import { NavBar } from "./components/layouts/NavBar";

export const App = () => {
    const isLoggedIn = useTracker(() => !!Meteor.userId(), []);

    return (
        <Router>
            <div className="min-h-screen bg-[#fdfaf7]">
                <NavBar />
                <RoutesConfig isLoggedIn={isLoggedIn} />
            </div>
        </Router>
    );
};