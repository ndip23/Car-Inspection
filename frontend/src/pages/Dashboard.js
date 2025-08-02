/ frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiPlus,  FiBarChart2 } from 'react-icons/fi';
import { fetchVehicles } from '../services/api';
import VehicleCard from '../components/ui/VehicleCard';
import Modal from '../components/ui/Modal'; 
import NewVehicleForm from '../components/ui/NewVehicleForm';

const Dashboard = () => {
    const [vehicles, setVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
    const [refetch, setRefetch] = useState(false); // State to trigger data refetching

    useEffect(() => {
        setLoading(true);
        fetchVehicles(searchTerm)
            .then(data => {
                setVehicles(data);
            })
            .catch(err => console.error("Failed to fetch vehicles", err))
            .finally(() => setLoading(false));
    }, [searchTerm, refetch]); // Add refetch as a dependency

    const handleVehicleCreated = () => {
        setRefetch(!refetch); // Toggle refetch state to trigger useEffect
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-3xl font-bold">Vehicle Dashboard</h1>
                    <Link to="/reports" className="flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary-hover text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    <FiBarChart2 />
                    <span>Reports</span>
                </Link>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full md:w-auto flex items-center justify-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                        <FiPlus />
                        <span>Register New Vehicle</span>
                    </button>
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
                        {vehicles.length > 0 ? (
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

            {/* NEW: Add the Modal to the page */}
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