// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiPlus, FiBarChart2, FiShield, FiSend, FiLoader } from 'react-icons/fi';
import { fetchVehicles, sendAllPendingReminders } from '../services/api';
import VehicleCard from '../components/ui/VehicleCard';
import Modal from '../components/ui/Modal';
import NewVehicleForm from '../components/ui/NewVehicleForm';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refetch, setRefetch] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchVehicles(searchTerm)
            .then(res => {
                // Defensive check: ensure the API response is an array before setting state.
                setVehicles(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => {
                console.error("Failed to fetch vehicles", err);
                toast.error("Could not load vehicles.");
                setVehicles([]); // Always fall back to a safe empty array on error.
            })
            .finally(() => setLoading(false));
    }, [searchTerm, refetch]);

    const handleVehicleCreated = () => {
        setRefetch(prev => !prev);
    };

    const handleSendAll = async () => {
        setSending(true);
        const toastId = toast.loading('Processing all pending reminders...');
        try {
            const { data } = await sendAllPendingReminders();
            if (data.total === 0) {
                toast.success('There were no pending reminders to send.', { id: toastId });
            } else {
                toast.success(`Processing complete! Sent: ${data.successCount}, Failed: ${data.failureCount}.`, { id: toastId, duration: 5000 });
            }
            window.dispatchEvent(new CustomEvent('notificationsUpdated'));
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred while processing reminders.', { id: toastId });
        } finally {
            setSending(false);
        }
    };

    // Guard clause: Prevents the component from rendering until the user object is available.
    // This stops the "Cannot read properties of null (reading 'role')" error.
    if (!user) {
        return <div className="text-center p-8">Loading user data...</div>;
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-3xl font-bold">Vehicle Dashboard</h1>
                    
                    <div className="flex items-center gap-2 w-full flex-wrap justify-center md:w-auto md:justify-end">
                        {user.role === 'admin' && (
                            <Link to="/admin" className="flex items-center justify-center space-x-2 bg-secondary/20 hover:bg-secondary/30 text-secondary font-bold py-2 px-4 rounded-lg transition duration-300">
                                <FiShield />
                                <span>Admin Panel</span>
                            </Link>
                        )}
                        
                        <button onClick={handleSendAll} disabled={sending} className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50">
                            {sending ? <FiLoader className="animate-spin" /> : <FiSend />}
                            <span>{sending ? 'Processing...' : 'Send All Reminders'}</span>
                        </button>
                        
                        <Link to="/reports" className="flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary-hover text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                            <FiBarChart2 />
                            <span>Reports</span>
                        </Link>
                        
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                            <FiPlus />
                            <span>Register Vehicle</span>
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by license plate..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <FiLoader className="animate-spin text-primary text-4xl" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Defensive check: Ensure 'vehicles' is a valid array before accessing .length */}
                        {Array.isArray(vehicles) && vehicles.length > 0 ? (
                            vehicles.map(vehicle => <VehicleCard key={vehicle._id} vehicle={vehicle} />)
                        ) : (
                            <div className="col-span-full text-center py-12 glass-card rounded-lg">
                                <h3 className="text-xl font-semibold">No Vehicles Found</h3>
                                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">Try a different search term or register a new vehicle.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <NewVehicleForm 
                    onClose={() => setIsModalOpen(false)}
                    onVehicleCreated={handleVehicleCreated}
                />
            </Modal>
        </>
    );
};

export default Dashboard;