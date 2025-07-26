// frontend/src/components/DeveloperRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDeveloperAuth } from '../context/DeveloperAuthContext';
import DeveloperLogin from '../pages/DeveloperLogin';

const DeveloperRoute = () => {
    const { user } = useAuth();
    const { isDevAuthenticated } = useDeveloperAuth();
    const devEmail = process.env.REACT_APP_DEV_EMAIL;
    const location = useLocation();

    // Condition 1: Must be the correct user
    if (!user || !devEmail || user.email !== devEmail) {
        return <Navigate to="/" replace />;
    }
    if (isDevAuthenticated) {
        return <Outlet />;
    } else {
        return <DeveloperLogin />;
    }
};

export default DeveloperRoute;