// frontend/src/pages/admin/SystemSettingsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchSettings, updateSettings } from '../../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft, FiLoader } from 'react-icons/fi';

const defaultSettings = {
  welcomeMessage: "Welcome to VisuTech, {{customerName}}! Your vehicle is now being inspected and should be ready in approximately 20 minutes.",
  passedMessage: "Congratulations, {{customerName}}! The inspection for your vehicle {{licensePlate}} has passed. Your next inspection is due on {{nextDueDate}}.",
  failedMessage: "Dear {{customerName}}, the inspection for your vehicle {{licensePlate}} has unfortunately failed. Please see the inspector for details on the necessary repairs.",
  whatsappReminder: "Reminder: The inspection for your vehicle {{2}} is due on {{3}}. Please visit VisuTech to renew. -VisuTech",
  emailReminderSubject: "Upcoming Vehicle Inspection Reminder for {{vehiclePlate}}",
  emailReminderBody: "<p>Dear {{customerName}},</p><p>This is a reminder that your vehicle with license plate <strong>{{vehiclePlate}}</strong> is due for its next technical inspection on <strong>{{dueDate}}</strong>.</p><p>Thank you!</p>"
};

const TemplateEditor = ({ title, name, value, onChange, placeholders, rows = 5 }) => (
    <div className="p-6 rounded-xl glass-card">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
            Available placeholders: {placeholders.map(p => <code key={p} className="bg-light-bg dark:bg-dark-bg p-1 rounded-md mx-1 font-mono">{p}</code>)}
        </p>
        <textarea 
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg font-mono text-sm"
        />
    </div>
);

const SystemSettingsPage = () => {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchSettings()
            .then(res => {
                setSettings(prev => ({ ...defaultSettings, ...res.data }));
            })
            .catch(() => toast.error('Failed to load settings.'))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    // --- THIS IS THE CORRECTED FUNCTION ---
    const handleSave = async () => {
        setSaving(true);
        try {
            // It should simply send the entire 'settings' object to the backend.
            await updateSettings(settings);
            toast.success('Settings saved successfully!');
        } catch (error) {
            toast.error('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };
    // ------------------------------------

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FiLoader className="animate-spin text-primary text-4xl" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                <FiArrowLeft />
                Back to Admin Dashboard
            </Link>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">System Settings</h1>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50">
                    <FiSave /> {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
            
            <TemplateEditor
                title="Welcome Message Template (SMS/Email)"
                name="welcomeMessage"
                value={settings.welcomeMessage}
                onChange={handleChange}
                placeholders={['{{customerName}}']}
            />
            <TemplateEditor
                title="Passed Inspection Template (SMS/Email)"
                name="passedMessage"
                value={settings.passedMessage}
                onChange={handleChange}
                placeholders={['{{customerName}}', '{{licensePlate}}', '{{nextDueDate}}']}
            />
            <TemplateEditor
                title="Failed Inspection Template (SMS/Email)"
                name="failedMessage"
                value={settings.failedMessage}
                onChange={handleChange}
                placeholders={['{{customerName}}', '{{licensePlate}}']}
            />

            <div className="p-6 rounded-xl glass-card">
                <h3 className="text-xl font-semibold mb-2">Due Date Reminder (SMS & WhatsApp)</h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                    Placeholders for WhatsApp must be positional (`{{1}}`, `{{2}}`, etc.). For SMS, placeholders will be replaced by name.
                </p>
                <textarea 
                    name="whatsappReminder"
                    value={settings.whatsappReminder}
                    onChange={handleChange}
                    rows="5"
                    className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg font-mono text-sm"
                />
            </div>
            <div className="p-6 rounded-xl glass-card">
                <h3 className="text-xl font-semibold mb-2">Due Date Reminder (Email)</h3>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                    Placeholders: <code className="bg-light-bg dark:bg-dark-bg p-1 rounded-md mx-1 font-mono">{'{{customerName}}'}</code>, 
                    <code className="bg-light-bg dark:bg-dark-bg p-1 rounded-md mx-1 font-mono">{'{{vehiclePlate}}'}</code>, 
                    <code className="bg-light-bg dark:bg-dark-bg p-1 rounded-md mx-1 font-mono">{'{{dueDate}}'}</code>. HTML is allowed in the body.
                </p>
                <label className="block font-medium mb-1">Subject</label>
                <input 
                    type="text"
                    name="emailReminderSubject"
                    value={settings.emailReminderSubject}
                    onChange={handleChange}
                    className="w-full p-3 mb-4 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg font-mono text-sm"
                />
                <label className="block font-medium mb-1">Body (HTML)</label>
                <textarea 
                    name="emailReminderBody"
                    value={settings.emailReminderBody}
                    onChange={handleChange}
                    rows="8"
                    className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg font-mono text-sm"
                />
            </div>
        </div>
    );
};

export default SystemSettingsPage;