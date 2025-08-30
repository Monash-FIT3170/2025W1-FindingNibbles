import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { MainUI } from '../pages/MainUI';
import { Map } from '../pages/Map';
import  AiSuggestion  from '../pages/AiSuggestion';
import { RoutesConfigProps } from '../types/User';
import { Profile } from '../pages/Profile';
import { SearchHistory } from '../pages/SearchHistory';
import { MealPlanner } from '../pages/MealPlanner';
import { SavedRestaurantsList } from '../pages/SavedRestaurants';
import { SavedPlans } from '../pages/SavedPlans';
import { PlanDetails } from '../pages/PlanDetails';
import { Discover } from '../pages/Discover';
import { TravelPlanning } from '../pages/TravelPlanning';


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
            <Route path="/ai-suggestion" element={requireAuth(<AiSuggestion />)} />
            <Route path="/profile" element={requireAuth(<Profile />)} />
            <Route path="/search-history" element={requireAuth(<SearchHistory />)} />
            <Route path="/meal-planner" element={requireAuth(<MealPlanner />)} />
            <Route path="/saved-restaurants" element={requireAuth(<SavedRestaurantsList />)} />
            <Route path="/travel-plans" element={requireAuth(<SavedPlans />)} />
            <Route path="/travel-plans/:planId" element={requireAuth(<PlanDetails />)} />
            <Route path="/discover" element={requireAuth(<Discover />)} />
            <Route path="/travel-planning" element={requireAuth(<TravelPlanning />)} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
