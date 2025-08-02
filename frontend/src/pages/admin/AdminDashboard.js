// frontend/src/pages/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchAdminStats, sendAllPendingReminders } from '../../services/api';
import { FiUsers, FiTruck, FiFileText, FiSend, FiLoader, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Register the necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    // State for the date range picker, defaulting to the current month
    const [dateRange, setDateRange] = useState([new Date(new Date().setDate(1)), new Date()]);
    const [startDate, endDate] = dateRange;

    // Fetch dashboard stats whenever the date range changes
    useEffect(() => {
        setLoading(true);
        fetchAdminStats(startDate, endDate)
            .then(res => {
                setStats(res.data);
            })
            .catch(err => {
                console.error("Failed to fetch admin stats:", err);
                toast.error("Could not load dashboard statistics.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [dateRange]);

    // Handler for the "Process Reminders" button
    const handleSendAll = async () => {
        setSending(true);
        const toastId = toast.loading('Processing all pending reminders...');
        try {
            const { data } = await sendAllPendingReminders();
            if (data.total === 0) {
                toast.success('There were no pending reminders to send.', { id: toastId });
            } else {
                toast.success(`Processing complete! Sent: ${data.successCount}, Failed: ${data.failureCount}.`, { id: toastId, duration: 5000 });
                // Note: To see the bell icon count update, the user would need to refresh the page.
            }
        } catch (error) {
            toast.error('An error occurred while processing reminders.', { id: toastId });
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FiLoader className="animate-spin text-primary text-4xl" />
            </div>
        );
    }

    if (!stats) {
        return <p className="text-center text-red-500">Could not load dashboard statistics. Please try refreshing the page.</p>;
    }

    // Configuration for the bar chart
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Inspections This Week' },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Inspections',
            data: stats.chartData,
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1,
        }],
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                                <FiArrowLeft />
                                Back to Dashboard
                            </Link>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary"/>
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setDateRange(update)}
                        isClearable={true}
                        className="pl-10 p-2 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border w-full md:w-auto"
                        placeholderText="Select date range"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<FiUsers />} title="Total Users" value={stats.totalUsers} />
                <StatCard icon={<FiTruck />} title="Total Vehicles" value={stats.totalVehicles} />
                <StatCard icon={<FiFileText />} title="Inspections (Range)" value={stats.inspectionsInRange} />
                <StatCard title="Pass Rate (Range)" value={`${stats.passFailRatio.toFixed(1)}%`} />
            </div>

            <div className="p-6 rounded-xl glass-card flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold">Action Center</h3>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        Process and send all pending inspection reminders.
                    </p>
                </div>
                <button onClick={handleSendAll} disabled={sending} className="flex items-center gap-2 px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-secondary-hover disabled:opacity-50 transition-colors">
                    {sending ? <FiLoader className="animate-spin" /> : <FiSend />}
                    {sending ? 'Processing...' : 'Process Reminders'}
                </button>
            </div>

            <div className="p-6 rounded-xl glass-card">
                <Bar options={chartOptions} data={chartData} />
            </div>
        </div>
    );
};

// Reusable StatCard component
const StatCard = ({ icon, title, value }) => (
    <div className="p-6 rounded-xl glass-card flex items-center gap-4">
        {icon && <div className="p-3 bg-primary/20 text-primary rounded-full text-2xl">{icon}</div>}
        <div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

export default AdminDashboard;