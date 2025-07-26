// frontend/src/components/layout/DashboardLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { fetchSettings } from '../../services/api';
import { differenceInDays, addDays } from 'date-fns';

const StatusBanner = ({ status, startDate }) => {
    const trialStartDate = new Date(startDate);
    const daysLeft = 14 - differenceInDays(new Date(), trialStartDate);

    if (status === 'trial') {
        return (
            <div className="bg-orange-500 text-white text-center text-sm py-1 font-semibold">
                Trial Version: {daysLeft > 0 ? `${daysLeft} days remaining.` : 'Trial expires today.'}
            </div>
        );
    }
    if (status === 'inactive') {
        return (
            <div className="bg-red-600 text-white text-center text-sm py-1 font-semibold">
                License Expired. Please contact support to reactivate the software.
            </div>
        );
    }
    return null; // Don't show a banner if status is 'active'
};

const DashboardLayout = () => {
  const [licenseInfo, setLicenseInfo] = useState({ status: 'active', startDate: null });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetchSettings();
        setLicenseInfo({
            status: res.data.licenseStatus || 'trial',
            startDate: res.data.trialStartDate
        });
      } catch (error) {
        // If settings can't be fetched, assume inactive for security
        setLicenseInfo({ status: 'inactive', startDate: null });
        console.error("Could not verify license status.");
      }
    };
    checkStatus();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <StatusBanner status={licenseInfo.status} startDate={licenseInfo.startDate} />
      <main className="flex-grow container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;