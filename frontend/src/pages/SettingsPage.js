// frontend/src/pages/SettingsPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link
import { useTheme } from '../context/ThemeContext';
import { changePassword, deleteAccount } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import { FiEye, FiEyeOff, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi'; // Import FiArrowLeft

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('appearance');

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* --- NEW: Back to Dashboard Link --- */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
        <FiArrowLeft />
        Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">App Settings</h1>
      <div className="flex border-b border-light-border dark:border-dark-border mb-6">
        {/* ... (rest of the component's JSX remains the same) ... */}
        <TabButton name="appearance" activeTab={activeTab} setActiveTab={setActiveTab}>Appearance</TabButton>
        <TabButton name="security" activeTab={activeTab} setActiveTab={setActiveTab}>Security</TabButton>
      </div>
      <div>
        {activeTab === 'appearance' && <AppearanceSettings />}
        {activeTab === 'security' && <SecuritySettings />}
      </div>
    </div>
  );
};

// ... (TabButton, AppearanceSettings, and SecuritySettings components remain unchanged)
const TabButton = ({ name, activeTab, setActiveTab, children }) => (
    <button onClick={() => setActiveTab(name)} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === name ? 'border-b-2 border-primary text-primary' : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'}`}>
        {children}
    </button>
);

const AppearanceSettings = () => {
    return (
        <div className="p-6 rounded-xl glass-card">
            <h3 className="text-xl font-semibold mb-4">Theme</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
                The application theme can be changed using the Sun/Moon icon in the navigation bar.
            </p>
        </div>
    )
}

const SecuritySettings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  // Delete Account State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    setPassLoading(true);
    try {
      await changePassword({ oldPassword, newPassword });
      toast.success('Password changed successfully! Please log in again.');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password.");
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteLoading(true);
    try {
        await deleteAccount({ password: deleteConfirmPassword });
        toast.success("Account deleted successfully.");
        logout();
        navigate('/login');
    } catch (error) {
        toast.error(error.response?.data?.message || "Account deletion failed.");
    } finally {
        setDeleteLoading(false);
        setIsModalOpen(false);
    }
  }

  const PasswordInput = ({ value, onChange, show, onToggle, placeholder }) => (
    <div className="relative">
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} required className="w-full bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary" />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary">{show ? <FiEyeOff /> : <FiEye />}</button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Change Password Form */}
      <form onSubmit={handlePasswordChange} className="p-6 rounded-xl glass-card space-y-4">
        <h3 className="text-xl font-semibold">Change Password</h3>
        <PasswordInput value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} show={showOld} onToggle={() => setShowOld(!showOld)} placeholder="Current Password" />
        <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} show={showNew} onToggle={() => setShowNew(!showNew)} placeholder="New Password" />
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required className="w-full bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary" />
        <div className="flex justify-end">
          <button type="submit" disabled={passLoading} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50">
            {passLoading ? 'Saving...' : 'Save Password'}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="p-6 rounded-xl border border-red-500/50 bg-red-500/10 space-y-4">
        <h3 className="text-xl font-semibold text-red-500">Danger Zone</h3>
        <p className="text-sm text-red-400">Once you delete your account, there is no going back. Please be certain.</p>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Delete My Account</button>
      </div>

      {/* Deletion Confirmation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleDeleteAccount} className="text-center space-y-4">
            <FiAlertTriangle className="mx-auto w-12 h-12 text-red-500"/>
            <h2 className="text-xl font-bold">Are you absolutely sure?</h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">This action cannot be undone. To confirm, please type your password below.</p>
            <input type="password" value={deleteConfirmPassword} onChange={(e) => setDeleteConfirmPassword(e.target.value)} placeholder="Enter your password" required className="w-full text-center bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"/>
            <button type="submit" disabled={deleteLoading} className="w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleteLoading ? 'Deleting...' : 'I understand, delete my account'}
            </button>
        </form>
      </Modal>
    </div>
  );
};
export default SettingsPage;