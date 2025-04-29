import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";

import { RoutesConfig } from "./routes/RoutesConfig";

export const App = () => {
  const login = true; // Change to false to see MapScreen

  
  return (
    <Router>
     <RoutesConfig />
    </Router>
  );
};
