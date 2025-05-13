import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { MainUI } from '../pages/MainUI';
import { Map } from '../pages/Map';
import { RoutesConfigProps } from '../types/User';
import { Profile } from '../pages/Profile';
import { SearchHistory } from '../pages/SearchHistory';
import { MealPlanner } from '../pages/MealPlanner';

export const RoutesConfig = ({ isLoggedIn }: RoutesConfigProps) => {
    const requireAuth = (component: JSX.Element) =>
        isLoggedIn ? component : <Navigate to="/mainUI" replace />;

    const redirectIfAuth = (component: JSX.Element) =>
        isLoggedIn ? <Navigate to="/" replace /> : component;

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/mainUI" element={redirectIfAuth(<MainUI />)} />
            <Route path="/login" element={redirectIfAuth(<Login />)} />
            <Route path="/register" element={redirectIfAuth(<Register />)} />

            {/* Protected Routes */}
            <Route path="/" element={requireAuth(<Map />)} />
            <Route path="/map" element={requireAuth(<Map />)} />
            <Route path="/profile" element={requireAuth(<Profile />)} />
            <Route path="/search-history" element={requireAuth(<SearchHistory />)} />
            <Route path="/meal-planner" element={requireAuth(<MealPlanner />)} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
