// frontend/src/pages/admin/SystemSettingsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSettings, updateSettings, } from '../../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const defaultTemplates = {
  whatsappReminder: "Dear {{1}}, This is a friendly reminder that your vehicle with license plate {{2}} is due for its next technical inspection on {{3}}. Please schedule your appointment with VisuTech soon. Thank you!",
  emailReminderSubject: "Upcoming Vehicle Inspection Reminder for {{vehiclePlate}}",
  emailReminderBody: "<p>Dear {{ownerName}},</p><p>This is a friendly reminder that your vehicle with license plate <strong>{{vehiclePlate}}</strong> is due for its next technical inspection on <strong>{{dueDate}}</strong>.</p><p>Please schedule your appointment with VisuTech soon.</p><p>Thank you,</p><p><strong>The VisuTech Team</strong></p>"
};

const SystemSettingsPage = () => {
    const [settings, setSettings] = useState(defaultTemplates);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchSettings()
            .then(res => {
                setSettings(prev => ({ ...prev, ...res.data }));
            })
            .catch(() => toast.error('Failed to load settings.'))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
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

    if (loading) return <p>Loading settings...</p>;

    return (
        <div className="space-y-6">
             <Link to="/" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                            <FiArrowLeft />
                            Back to Dashboard
                        </Link>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">System Settings</h1>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50">
                    <FiSave /> {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            {/* WhatsApp Template Section */}
            <div className="p-6 rounded-xl glass-card">
                <h3 className="text-xl font-semibold mb-2">WhatsApp Reminder Template</h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                    {/* --- THIS IS THE FIX --- */}
                    {'Placeholders: `{{1}}` (Owner Name), `{{2}}` (License Plate), `{{3}}` (Due Date).'}
                </p>
                <textarea 
                    name="whatsappReminder"
                    value={settings.whatsappReminder}
                    onChange={handleChange}
                    rows="5"
                    className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg"
                />
            </div>

            {/* Email Template Section */}
            <div className="p-6 rounded-xl glass-card">
                <h3 className="text-xl font-semibold mb-2">Email Reminder Template</h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                    {/* --- THIS IS THE FIX --- */}
                    {'Placeholders: `{{ownerName}}`, `{{vehiclePlate}}`, `{{dueDate}}`. HTML is allowed in the body.'}
                </p>
                <label className="block font-medium mb-1">Subject</label>
                <input 
                    type="text"
                    name="emailReminderSubject"
                    value={settings.emailReminderSubject}
                    onChange={handleChange}
                    className="w-full p-3 mb-4 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg"
                />
                <label className="block font-medium mb-1">Body (HTML)</label>
                <textarea 
                    name="emailReminderBody"
                    value={settings.emailReminderBody}
                    onChange={handleChange}
                    rows="8"
                    className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg"
                />
            </div>
        </div>
    );
};

export default SystemSettingsPage;