// src/components/layout/DashboardLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;