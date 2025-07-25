// server/models/Vehicle.js
import mongoose from 'mongoose';

const vehicleSchema = mongoose.Schema(
  {
    license_plate: { type: String, required: true, unique: true, uppercase: true, trim: true },
    
    // UPDATED: Category now reflects Cameroonian License Categories
    category: { 
        type: String, 
        required: true, 
        enum: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'] 
    },
    vehicle_type: { type: String, required: true }, // e.g., Sedan, Motorcycle, Heavy Goods Truck
    
    // OWNER INFO
    owner_name: { type: String, required: true },
    owner_phone: { type: String, required: true },
    owner_email: { type: String, required: true },
    owner_whatsapp: { type: String, required: false, default: '' },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;