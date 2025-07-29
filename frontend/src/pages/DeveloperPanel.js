// frontend/src/pages/DeveloperPanel.js
import React, { useState, useEffect } from 'react';
import { fetchSettings, updateSettings } from '../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker'; // We need the date picker here
import { format } from 'date-fns';

const DeveloperPanel = () => {
    const [settings, setSettings] = useState({ 
        smsGatewayUrl: '', 
        licenseStatus: 'trial',
        trialStartDate: new Date().toISOString() // Ensure a default
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchSettings()
            .then(res => setSettings(prev => ({ ...prev, ...res.data })))
            .catch(() => toast.error('Failed to load settings.'))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date) => {
        setSettings({ ...settings, trialStartDate: date.toISOString() });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSettings(settings);
            toast.success('Settings saved successfully!');
        } catch (error) {
            toast.error('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) return <p>Loading Developer Panel...</p>;

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                <FiArrowLeft /> Back to Dashboard
            </Link>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Developer Panel</h1>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50">
                    <FiSave /> {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            {/* SMS Gateway Configuration (No changes here) */}
            <div className="p-6 rounded-xl glass-card">
                {/* ... */}
            </div>

            {/* --- NEW, ENHANCED LICENSE MANAGEMENT SECTION --- */}
            <div className="p-6 rounded-xl glass-card">
                <h3 className="text-xl font-semibold mb-4">Application License Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status Control */}
                    <div>
                        <label className="block font-medium mb-1">Set License Status</label>
                        <select
                            name="licenseStatus"
                            value={settings.licenseStatus}
                            onChange={handleChange}
                            className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg"
                        >
                            <option value="trial">Trial</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive (Disabled)</option>
                        </select>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">
                            - **Trial:** Activates a 14-day trial from the start date.<br/>
                            - **Active:** The application is fully paid and unlocked.<br/>
                            - **Inactive:** The application is locked.
                        </p>
                    </div>
                    {/* Trial Date Control */}
                    <div>
                        <label className="block font-medium mb-1">Set Trial Start Date</label>
                        <DatePicker
                            selected={new Date(settings.trialStartDate)}
                            onChange={handleDateChange}
                            dateFormat="MMMM d, yyyy"
                            className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg"
                        />
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2">
                            The 14-day trial period begins from this date. Change this to restart or set a future trial.
                            Current Expiry: <strong>{format(new Date(new Date(settings.trialStartDate).setDate(new Date(settings.trialStartDate).getDate() + 14)), 'MMMM d, yyyy')}</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeveloperPanel;