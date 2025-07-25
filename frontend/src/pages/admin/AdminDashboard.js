// frontend/src/pages/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchAdminStats } from '../../services/api'; // We'll create this api call next
import { FiUsers, FiTruck, FiFileText, FiArrowLeft } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats()
            .then(res => setStats(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading dashboard...</p>;
    if (!stats) return <p>Could not load dashboard statistics.</p>;

    const chartOptions = {
        responsive: true,
        plugins: { legend: { position: 'top' }, title: { display: true, text: 'Inspections This Week' } },
    };
    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Inspections',
            data: stats.chartData,
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
        }],
    };

    return (
        <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                <FiArrowLeft />
                                Back to Dashboard
                            </Link>
            
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<FiUsers />} title="Total Users" value={stats.totalUsers} />
                <StatCard icon={<FiTruck />} title="Total Vehicles" value={stats.totalVehicles} />
                <StatCard icon={<FiFileText />} title="Inspections (Month)" value={stats.inspectionsThisMonth} />
                <StatCard title="Pass Rate (Month)" value={`${stats.passFailRatio.toFixed(1)}%`} />
            </div>
            <div className="p-6 rounded-xl glass-card">
                <Bar options={chartOptions} data={chartData} />
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value }) => (
    <div className="p-6 rounded-xl glass-card flex items-center gap-4">
        {icon && <div className="p-3 bg-primary/20 text-primary rounded-full">{icon}</div>}
        <div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

export default AdminDashboard;