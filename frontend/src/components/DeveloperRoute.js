// frontend/src/components/DeveloperRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DeveloperRoute = () => {
    const { user } = useAuth();
    const devEmail = process.env.REACT_APP_DEV_EMAIL;

    // This guard now has one simple job:
    // If you are not the developer, you cannot access this route at all.
    if (!user || !devEmail || user.email !== devEmail) {
        return <Navigate to="/" replace />;
    }

    // If you are the developer, show the content (the Developer Panel).
    return <Outlet />;
};

export default DeveloperRoute;