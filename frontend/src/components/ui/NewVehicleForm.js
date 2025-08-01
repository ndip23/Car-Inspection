// frontend/src/components/ui/NewVehicleForm.js
import React, { useState } from 'react';
import { createVehicle } from '../../services/api';
import { FiSave } from 'react-icons/fi';
import PhoneNumberInput from './PhoneNumberInput';

const vehicleTypesByCategory = {
    'Category A ': ['Taxi', 'Driving School Car'],
    'Category B ': ['Private Car'],
    'Category B1 ': ['Pickup', 'Van', 'Ambulance', 'Minivan'],
    'Category C ': ['Minibus '],
    'Category C+ ': ['Grand Bus '],
    'Category D': ['Light Truck', 'Heavy Goods Truck', 'Dump Truck', 'Cargo Carrier']
};
const vehicleCategories = Object.keys(vehicleTypesByCategory);

const NewVehicleForm = ({ onClose, onVehicleCreated }) => {
  const [formData, setFormData] = useState({
    license_plate: '', category: '', vehicle_type: '', customer_name: '',
    customer_phone_code: '+237', customer_phone_number: '',
    customer_whatsapp_code: '+237', customer_whatsapp_number: '', customer_email: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      const newVehicleTypes = vehicleTypesByCategory[value] || [];
      const defaultVehicleType = newVehicleTypes[0] || '';
      setFormData(prev => ({ ...prev, category: value, vehicle_type: defaultVehicleType }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const payload = {
      license_plate: formData.license_plate, category: formData.category, vehicle_type: formData.vehicle_type,
      customer_name: formData.customer_name, customer_email: formData.customer_email,
      customer_phone: formData.customer_phone_code + formData.customer_phone_number,
      customer_whatsapp: formData.customer_whatsapp_number ? formData.customer_whatsapp_code + formData.customer_whatsapp_number : '',
    };
    try {
      // The API call returns the new vehicle data in `res.data`
      const res = await createVehicle(payload);
      
      // Pass the newly created vehicle object back up to the Dashboard component
      onVehicleCreated(res.data);
      
      onClose(); // Close the modal
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register vehicle.');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full p-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-4">Register New Vehicle</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <h3 className="text-lg font-semibold border-b border-light-border dark:border-dark-border pb-1">Vehicle Details</h3>
        <input type="text" name="license_plate" placeholder="License Plate" value={formData.license_plate} onChange={handleChange} required className={inputClass} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select name="category" value={formData.category} onChange={handleChange} required className={inputClass}>
            <option value="" disabled>Select License Category</option>
            {vehicleCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} required disabled={!formData.category} className={`${inputClass} disabled:opacity-50`}>
            {formData.category && vehicleTypesByCategory[formData.category].map(type => <option key={type} value={type}>{type}</option>)}
            {!formData.category && <option value="" disabled>Select a category first</option>}
          </select>
        </div>
        <h3 className="text-lg font-semibold border-b border-light-border dark:border-dark-border pb-1 pt-3">Customer's Details</h3>
        <input type="text" name="customer_name" placeholder="Customer's Full Name" value={formData.customer_name} onChange={handleChange} required className={inputClass} />
        <PhoneNumberInput label="Customer's Phone *" namePrefix="customer_phone" countryCode={formData.customer_phone_code} onCountryCodeChange={handleChange} phoneNumber={formData.customer_phone_number} onPhoneNumberChange={handlePhoneChange} />
        <PhoneNumberInput label="Customer's WhatsApp (Optional)" namePrefix="customer_whatsapp" countryCode={formData.customer_whatsapp_code} onCountryCodeChange={handleChange} phoneNumber={formData.customer_whatsapp_number} onPhoneNumberChange={handlePhoneChange} required={false} />
        <input type="email" name="customer_email" placeholder="Customer's Email" value={formData.customer_email} onChange={handleChange} required className={inputClass} />
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