// frontend/src/components/ui/VehicleCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const VehicleCard = ({ vehicle }) => (
    <Link to={`/vehicle/${vehicle._id}`} className="block group">
        <div className="p-6 rounded-xl glass-card h-full group-hover:-translate-y-1 group-hover:shadow-xl transition-transform duration-300">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-primary">{vehicle.license_plate}</h3>
                <span className="text-xs bg-light-bg dark:bg-dark-bg px-2 py-1 rounded-full font-semibold">{vehicle.category}</span>
            </div>
            {/* REMOVED: vehicle.make is no longer here */}
            <p className="font-semibold mt-2">{vehicle.vehicle_type}</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{vehicle.owner_name}</p>
        </div>
    </Link>
);

export default VehicleCard;