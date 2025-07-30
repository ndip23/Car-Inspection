// server/models/Vehicle.js
import mongoose from 'mongoose';

// --- NEW CATEGORY LIST ---
const vehicleCategories = [
    'Category A (Taxi/Driving School)',
    'Category B (Private Cars)',
    'Category B1 (Pickup/Van/Ambulance)',
    'Category C (Minibus)',
    'Category C+ (Grand Bus)',
    'Category D (Trucks/Heavy Duty/Cargo Carriers)'
];

const vehicleSchema = mongoose.Schema(
  {
    license_plate: { type: String, required: true, unique: true, uppercase: true, trim: true },
    
    // UPDATED: Category now uses the new, specific list
    category: { 
        type: String, 
        required: true, 
        enum: vehicleCategories
    },
    vehicle_type: { type: String, required: true }, // e.g., Toyota Yaris, MAN Truck
    
    // --- UPDATED: Fields are now "customer" instead of "owner" ---
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true },
    customer_email: { type: String, required: true },
    customer_whatsapp: { type: String, required: false, default: '' },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;