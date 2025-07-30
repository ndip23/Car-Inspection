// frontend/src/components/admin/AdminLayout.js
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiGrid, FiUsers, FiTruck, FiTrendingUp, FiSliders, FiHeart } from 'react-icons/fi'; 
import Navbar from '../layout/Navbar';

const AdminLayout = () => {
    const location = useLocation();
    const getLinkClass = (path) => {
        return location.pathname === path
            ? 'bg-primary/20 text-primary'
            : 'hover:bg-light-bg dark:hover:bg-dark-bg';
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-grow container mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6">
                <aside className="md:w-64 flex-shrink-0">
                    <div className="p-4 rounded-xl glass-card h-full">
                        <h2 className="text-lg font-bold mb-4">Admin Panel</h2>
                        <nav className="space-y-2">
                            <NavLink to="/admin" end className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${getLinkClass('/admin')}`}>
                                <FiGrid /><span>Dashboard</span>
                            </NavLink>
                            <NavLink to="/admin/users" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${getLinkClass('/admin/users')}`}>
                                <FiUsers /><span>User Management</span>
                            </NavLink>
                            {/*<NavLink to="/admin/vehicles" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${getLinkClass('/admin/vehicles')}`}>
                                <FiTruck /><span>Vehicle Database</span>
                            </NavLink>*/}
                            <NavLink to="/admin/performance" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${getLinkClass('/admin/performance')}`}>
                                <FiTrendingUp /><span>Performance</span>
                            </NavLink>
                            {/* --- ADD THE SETTINGS LINK --- */}
                            <NavLink to="/admin/settings" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${getLinkClass('/admin/settings')}`}>
                                <FiSliders /><span>System Settings</span>
                            </NavLink>
                            <NavLink to="/admin/customer-reports" className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${getLinkClass('/admin/customer-reports')}`}>
                                <FiHeart /><span>Customer Reports</span>
                            </NavLink>
                        </nav>
                    </div>
                </aside>
                <main className="flex-grow">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;