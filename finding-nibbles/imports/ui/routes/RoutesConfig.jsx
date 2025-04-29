import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import { Login } from "../pages/Login";
import { Map } from "../pages/Map";
import { MainUI } from "../pages/MainUI";
import { Register } from "../pages/Register";

export const RoutesConfig = () => {
    return (
        <Routes>
            <Route path="/" element={<MainUI />} />
            <Route path="/login" element={<Login />} />
            <Route path="/map" element={<Map />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    );
};
