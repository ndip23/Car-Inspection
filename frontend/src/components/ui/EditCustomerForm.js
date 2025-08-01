// frontend/src/components/ui/EditCustomerForm.js
import React, { useState } from 'react';
import { FiSave } from 'react-icons/fi';
import PhoneNumberInput from './PhoneNumberInput'; // We'll reuse this component

const EditCustomerForm = ({ vehicle, onUpdate, onCancel }) => {
    // Extract country code and local number from the full phone numbers
    const extractPhoneParts = (fullNumber, defaultCode) => {
        if (!fullNumber) return { code: defaultCode, number: '' };
        // A simple logic, assuming common country codes
        const code = fullNumber.startsWith('+') ? fullNumber.substring(0, 4) : defaultCode;
        const number = fullNumber.replace(code, '');
        return { code, number };
    };
    
    const [formData, setFormData] = useState({
        customer_name: vehicle.customer_name || '',
        customer_email: vehicle.customer_email || '',
        customer_phone_code: extractPhoneParts(vehicle.customer_phone, '+237').code,
        customer_phone_number: extractPhoneParts(vehicle.customer_phone, '+237').number,
        customer_whatsapp_code: extractPhoneParts(vehicle.customer_whatsapp, '+237').code,
        customer_whatsapp_number: extractPhoneParts(vehicle.customer_whatsapp, '+237').number,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handlePhoneChange = (e) => {
        if (/^\d*$/.test(e.target.value)) {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            customer_name: formData.customer_name,
            customer_email: formData.customer_email,
            customer_phone: formData.customer_phone_code + formData.customer_phone_number,
            customer_whatsapp: formData.customer_whatsapp_number ? formData.customer_whatsapp_code + formData.customer_whatsapp_number : '',
        };
        await onUpdate(payload);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Edit Customer Information</h2>
            <input type="text" name="customer_name" placeholder="Customer's Full Name" value={formData.customer_name} onChange={handleChange} required className="w-full p-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg" />
            <PhoneNumberInput label="Customer's Phone *" namePrefix="customer_phone" countryCode={formData.customer_phone_code} onCountryCodeChange={handleChange} phoneNumber={formData.customer_phone_number} onPhoneNumberChange={handlePhoneChange} />
            <PhoneNumberInput label="Customer's WhatsApp (Optional)" namePrefix="customer_whatsapp" countryCode={formData.customer_whatsapp_code} onCountryCodeChange={handleChange} phoneNumber={formData.customer_whatsapp_number} onPhoneNumberChange={handlePhoneChange} required={false} />
            <input type="email" name="customer_email" placeholder="Customer's Email" value={formData.customer_email} onChange={handleChange} required className="w-full p-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg" />
            <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border">Cancel</button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50">
                    <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default EditCustomerForm;