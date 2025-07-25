// frontend/src/pages/DeveloperPanel.js
import React, {useState, useEffect } from 'react';
import { fetchSettings, updateSettings } from '../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiZap, FiArrowLeft } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const DeveloperPanel = () => {
    const { user } = useAuth(); // Get the current user
    const navigate = useNavigate(); // Hook for navigation

    const [settings, setSettings] = useState({ smsGatewayUrl: '', licenseStatus: 'trial' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- THIS IS THE NEW SECURITY CHECK ---
    useEffect(() => {
        // This effect runs once when the component mounts.
        const devEmail = process.env.REACT_APP_DEV_EMAIL;
        if (!user || !devEmail || user.email !== devEmail) {
            // If the user is not the developer, redirect them immediately.
            toast.error("You are not authorized to view this page.");
            navigate('/'); // Redirect to the main dashboard
        }
    }, [user, navigate]);
    // ------------------------------------

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
    
    const handleActivate = () => {
        setSettings(prev => ({ ...prev, licenseStatus: 'active' }));
        toast('License status set to Active. Click "Save All Changes" to apply.', { icon: '💡' });
    };

    if (loading) return <p>Loading Developer Panel...</p>;

    // The rest of the JSX remains the same
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
            <div className={`p-6 rounded-xl border ${settings.licenseStatus === 'trial' ? 'border-orange-500/50 bg-orange-500/10' : 'border-green-500/50 bg-green-500/10'}`}>
                <h3 className="text-xl font-semibold mb-2">Application License</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p>Current Status: 
                            <span className={`font-bold ml-2 ${settings.licenseStatus === 'trial' ? 'text-orange-500' : 'text-green-500'}`}>
                                {settings.licenseStatus.toUpperCase()}
                            </span>
                        </p>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            {settings.licenseStatus === 'trial' ? 'The application is currently in trial mode.' : 'The application is fully activated.'}
                        </p>
                    </div>
                    {settings.licenseStatus !== 'active' && (
                        <button onClick={handleActivate} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                            <FiZap /> Activate Full Version
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeveloperPanel;