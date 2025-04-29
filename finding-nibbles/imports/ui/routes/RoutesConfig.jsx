import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import { Login } from "../pages/Login";
import { Map } from "../pages/Map";
import { MainUI } from "../pages/MainUI";

export const RoutesConfig = () => {
    return (
        <Routes>
            <Route path="/" element={<MainUI />} />
            <Route path="/login" element={<Login />} />
            <Route path="/map" element={<Map />} />
        </Routes>
    );
};
