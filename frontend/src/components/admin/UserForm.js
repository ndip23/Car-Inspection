// frontend/src/components/admin/UserForm.js
import React, { useState } from 'react';
import { FiSave } from 'react-icons/fi';

const UserForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        password: '', // Password is only for creating new users
        role: initialData?.role || 'inspector',
    });

    const isEditing = !!initialData; // Determine if we are in "edit" mode

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputClass = "w-full p-3 bg-light-bg/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center">
                {isEditing ? 'Edit User Role' : 'Create New User'}
            </h2>
            
            {/* Fields for creating a new user */}
            {!isEditing && (
                <>
                    <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className={inputClass} />
                    <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className={inputClass} />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className={inputClass} />
                </>
            )}

            {/* Role selection is available for both creating and editing */}
            <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className={inputClass}>
                    <option value="inspector">Inspector</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border">
                    Cancel
                </button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50">
                    <FiSave />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default UserForm;