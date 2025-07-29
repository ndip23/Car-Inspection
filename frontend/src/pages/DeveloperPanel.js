// frontend/src/pages/DeveloperPanel.js
import React, { useState, useEffect } from 'react';
import { fetchSettings, updateSettings } from '../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { format, addDays } from 'date-fns'; // Import addDays

const DeveloperPanel = () => {
    const [settings, setSettings] = useState({ 
        smsGatewayUrl: '', 
        licenseStatus: 'trial',
        trialStartDate: new Date().toISOString()
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
                <FiArrowLeft />
                Back to Dashboard
            </Link>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Developer Panel</h1>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50">
                    <FiSave /> {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            {/* --- THIS SECTION IS NOW RESTORED --- */}
            <div className="p-6 rounded-xl glass-card">
                <h3 className="text-xl font-semibold mb-2">Local SMS Gateway Configuration</h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                    Enter the public URL (e.g., from ngrok) for the client's SMS gateway.
                </p>
                <label className="block font-medium mb-1">Gateway URL</label>
                <input 
                    type="text"
                    name="smsGatewayUrl"
                    value={settings.smsGatewayUrl || ''}
                    onChange={handleChange}
                    placeholder="https://xxxxxxxx.ngrok.io"
                    className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg"
                />
            </div>

            {/* --- AND THIS SECTION IS ALSO HERE --- */}
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
                        <ul className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2 list-disc list-inside space-y-1">
                            <li><b>Trial:</b> Activates a 14-day trial from the start date.</li>
                            <li><b>Active:</b> The application is fully paid and unlocked.</li>
                            <li><b>Inactive:</b> The application is locked.</li>
                        </ul>
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
                            The 14-day trial period begins from this date.
                            <br/>
                            Current Expiry: <strong>{format(addDays(new Date(settings.trialStartDate), 14), 'MMMM d, yyyy')}</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeveloperPanel;