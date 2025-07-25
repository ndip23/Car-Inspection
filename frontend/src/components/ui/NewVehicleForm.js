// frontend/src/components/ui/NewVehicleForm.js
import React, { useState } from 'react';
import { createVehicle } from '../../services/api';
import { FiSave } from 'react-icons/fi';
import PhoneNumberInput from './PhoneNumberInput';

// This object is now only used for the Category dropdown
const vehicleLicenseCategories = {
  'Category A': ['Motorcycle (Light)', 'Motorcycle (Heavy)', 'Tricycle'],
  'Category B': ['Sedan', 'SUV', 'Hatchback', 'Station Wagon', 'Pickup (Light)'],
  'Category C': ['Light Truck (3.5T - 11T)', 'Heavy Goods Truck (11T+)', 'Dump Truck'],
  'Category D': ['Minibus (10-20 seats)', 'Coach Bus (21+ seats)'],
  'Category E': ['Articulated Truck (Semi-trailer)', 'Truck with Trailer (Rigid + Trailer)'],
};

const NewVehicleForm = ({ onClose, onVehicleCreated }) => {
  const [formData, setFormData] = useState({
    license_plate: '',
    category: '',
    vehicle_type: '', // This will now be populated by a text input
    owner_name: '',
    owner_phone_code: '+237',
    owner_phone_number: '',
    owner_whatsapp_code: '+237',
    owner_whatsapp_number: '',
    owner_email: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- LOGIC IS NOW SIMPLIFIED ---
  // The complex logic for dependent dropdowns is no longer needed.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      license_plate: formData.license_plate,
      category: formData.category,
      vehicle_type: formData.vehicle_type,
      owner_name: formData.owner_name,
      owner_email: formData.owner_email,
      owner_phone: formData.owner_phone_code + formData.owner_phone_number,
      owner_whatsapp: formData.owner_whatsapp_number 
        ? formData.owner_whatsapp_code + formData.owner_whatsapp_number 
        : '',
    };

    try {
      await createVehicle(payload);
      onVehicleCreated();
      onClose();
    } catch (err)
     {
      setError(err.response?.data?.message || 'Failed to register vehicle.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-4">Register New Vehicle</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Vehicle Details Section */}
        <h3 className="text-lg font-semibold border-b border-light-border dark:border-dark-border pb-1">Vehicle Details</h3>
        <input type="text" name="license_plate" placeholder="License Plate" value={formData.license_plate} onChange={handleChange} required className={inputClass} />
        
        {/* --- JSX IS NOW UPDATED --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="category" value={formData.category} onChange={handleChange} required className={inputClass}>
            <option value="" disabled>Select License Category</option>
            {/* We can use Object.keys directly on the category object now */}
            {Object.keys(vehicleLicenseCategories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          
          {/* The <select> has been replaced with an <input type="text"> */}
          <input 
            type="text"
            name="vehicle_type"
            placeholder="Vehicle Type (e.g., Sedan, SUV)"
            value={formData.vehicle_type}
            onChange={handleChange}
            required
            className={inputClass}
            disabled={!formData.category} // Still a good idea to disable until a category is chosen
          />
        </div>

        {/* Owner's Details Section (No changes here) */}
        <h3 className="text-lg font-semibold border-b border-light-border dark:border-dark-border pb-1 pt-3">Owner's Details</h3>
        <input type="text" name="owner_name" placeholder="Owner's Full Name" value={formData.owner_name} onChange={handleChange} required className={inputClass} />
        <PhoneNumberInput 
          label="Owner's Phone *"
          namePrefix="owner_phone"
          countryCode={formData.owner_phone_code}
          onCountryCodeChange={handleChange}
          phoneNumber={formData.owner_phone_number}
          onPhoneNumberChange={handlePhoneChange}
        />
        <PhoneNumberInput 
          label="Owner's WhatsApp (Optional)"
          namePrefix="owner_whatsapp"
          countryCode={formData.owner_whatsapp_code}
          onCountryCodeChange={handleChange}
          phoneNumber={formData.owner_whatsapp_number}
          onPhoneNumberChange={handlePhoneChange}
          required={false}
        />
        <input type="email" name="owner_email" placeholder="Owner's Email" value={formData.owner_email} onChange={handleChange} required className={inputClass} />
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50">
                <FiSave/>
                <span>{loading ? 'Saving...' : 'Save Vehicle'}</span>
            </button>
        </div>
      </form>
    </div>
  );
};

export default NewVehicleForm;