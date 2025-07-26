// frontend/src/components/DeveloperRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DeveloperRoute = () => {
    const { user } = useAuth();
    const devEmail = process.env.REACT_APP_DEV_EMAIL;

    // Redirect if not logged in, if dev email isn't set, or if emails don't match
    if (!user || !devEmail || user.email !== devEmail) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default DeveloperRoute;