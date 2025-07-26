// frontend/src/components/layout/DashboardLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { fetchSettings } from '../../services/api'; // Import API call

const TrialBanner = () => (
    <div className="bg-orange-500 text-white text-center text-sm py-1 font-semibold">
        This is a Trial Version of the Software.
    </div>
);

const DashboardLayout = () => {
  const [isTrial, setIsTrial] = useState(false);

  useEffect(() => {
    // Check the application's license status when the layout loads
    const checkStatus = async () => {
      try {
        const res = await fetchSettings();
        if (res.data.licenseStatus === 'trial') {
          setIsTrial(true);
        }
      } catch (error) {
        console.error("Could not verify license status.");
      }
    };
    checkStatus();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {isTrial && <TrialBanner />} {/* Conditionally render the banner */}
      <main className="flex-grow container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;