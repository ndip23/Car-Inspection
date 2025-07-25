// frontend/src/components/admin/AdminRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />; // Redirect non-admins to main dashboard

    return <Outlet />;
};

export default AdminRoute;