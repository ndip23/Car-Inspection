// frontend/src/pages/ProfileSettingsPage.js
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, updateUserAvatar } from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiCamera, FiSave, FiLoader, FiArrowLeft } from 'react-icons/fi'; // Import FiArrowLeft

const ProfileSettingsPage = () => {
  const { user, updateUserContext } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  // ... (handleProfileUpdate and handleAvatarChange functions remain the same)
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateUserProfile({ name, email });
      updateUserContext(data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    setAvatarLoading(true);

    try {
      const { data } = await updateUserAvatar(formData);
      updateUserContext(data);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload picture.');
    } finally {
      setAvatarLoading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* --- NEW: Back to Dashboard Link --- */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
        <FiArrowLeft />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold">Profile & Settings</h1>

      {/* Profile Picture Section */}
      <div className="p-6 rounded-xl glass-card flex flex-col sm:flex-row items-center gap-6">
        {/* ... (rest of the component's JSX remains the same) ... */}
        <div className="relative">
          {user.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-light-border dark:bg-dark-border flex items-center justify-center">
              <FiUser className="w-12 h-12 text-light-text-secondary dark:text-dark-text-secondary" />
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current.click()} disabled={avatarLoading} className="absolute -bottom-1 -right-1 p-2 bg-primary rounded-full text-white hover:bg-primary-hover transition-colors">
            {avatarLoading ? <FiLoader className="animate-spin" /> : <FiCamera />}
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">{user.email}</p>
        </div>
      </div>

      {/* Update Profile Information Form */}
      <div className="p-6 rounded-xl glass-card">
        <h3 className="text-xl font-semibold mb-4">Update Information</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50">
                <FiSave />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;