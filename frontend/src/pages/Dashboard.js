// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Added for admin button
import { FiSearch, FiPlus, FiBarChart2, FiShield, FiSend, FiLoader } from 'react-icons/fi'; // Added new icons
import { fetchVehicles, sendAllPendingReminders } from '../services/api'; // Added sendAllPendingReminders
import VehicleCard from '../components/ui/VehicleCard';
import Modal from '../components/ui/Modal'; 
import NewVehicleForm from '../components/ui/NewVehicleForm';
import toast from 'react-hot-toast'; // Added for user feedback

const Dashboard = () => {
    const { user } = useAuth(); // Added to get the current user
    const [vehicles, setVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refetch, setRefetch] = useState(false);

    // --- NEW STATE for the "Send All Reminders" button ---
    const [sending, setSending] = useState(false);

    // --- YOUR ORIGINAL, WORKING DATA-FETCHING LOGIC ---
    // This is the logic you provided that correctly fetches vehicles.
    useEffect(() => {
        setLoading(true);
        fetchVehicles(searchTerm)
            .then(res => {
                // We add one small safety check here to prevent future crashes.
                // This correctly handles the API response.
                setVehicles(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => {
                console.error("Failed to fetch vehicles", err)
                setVehicles([]); // Ensure it's an empty array on error
            })
            .finally(() => setLoading(false));
    }, [searchTerm, refetch]);
    // ---------------------------------------------------

    // Your original, working refetch trigger
    const handleVehicleCreated = () => {
        setRefetch(prev => !prev);
    };

    // --- NEW HANDLER FUNCTION for the new button ---
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

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-3xl font-bold">Vehicle Dashboard</h1>
                    
                    {/* --- UPDATED BUTTON GROUP to include new buttons --- */}
                    <div className="flex items-center gap-2 w-full flex-wrap justify-center md:w-auto md:justify-end">
                        {user && user.role === 'admin' && (
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
                            className="w-full md:w-auto flex items-center justify-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg transition duration-300">
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
                    <p className='text-center text-light-text-secondary dark:text-dark-text-secondary'>Loading vehicles...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Your original, working display logic, with a safety check */}
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