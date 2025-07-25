// frontend/src/pages/admin/UserManagementPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { fetchAllUsers, toggleUserStatus, adminCreateUser, updateUserRole } from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import UserForm from '../../components/admin/UserForm';
import { FiPlus, FiEdit, FiToggleLeft, FiToggleRight, FiUser, FiArrowLeft } from 'react-icons/fi'; // Import FiArrowLeft
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const UserManagementPage = () => {
    // ... (all state and handler functions remain the same)
    const { user: adminUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const loadUsers = () => {
        setLoading(true);
        fetchAllUsers().then(res => setUsers(res.data)).catch(() => toast.error('Failed to fetch users.')).finally(() => setLoading(false));
    };
    useEffect(() => { loadUsers(); }, []);
    
    const handleToggleStatus = async (userId, currentStatus) => {
        const optimisticUsers = users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u);
        setUsers(optimisticUsers);
        try {
            const { data } = await toggleUserStatus(userId);
            toast.success(data.message);
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed.');
            setUsers(users);
        }
    };
    
    const handleCreateUser = async (formData) => {
        setFormLoading(true);
        try {
            await adminCreateUser(formData);
            toast.success('User created successfully!');
            setIsCreateModalOpen(false);
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user.');
        } finally {
            setFormLoading(false);
        }
    };
    
    const handleEditRole = async (formData) => {
        setFormLoading(true);
        try {
            await updateUserRole(selectedUser._id, formData.role);
            toast.success('User role updated successfully!');
            setIsEditModalOpen(false);
            setSelectedUser(null);
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role.');
        } finally {
            setFormLoading(false);
        }
    };
    
    const openEditModal = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };


    return (
        <>
            <div className="space-y-4">
                {/* --- NEW: Back to Admin Dashboard Link --- */}
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors">
                    <FiArrowLeft />
                    Back to Dashboard
                </Link>

                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover">
                        <FiPlus /> Create User
                    </button>
                </div>

                {/* ... (rest of the component's JSX remains the same) ... */}
                <div className="p-6 rounded-xl glass-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-light-border dark:border-dark-border">
                                    <th className="p-3">User</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Joined</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center p-4">Loading users...</td></tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user._id} className="border-b border-light-border/50 dark:border-dark-border/50">
                                            <td className="p-3 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-light-bg dark:bg-dark-bg flex-shrink-0 flex items-center justify-center">
                                                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" /> : <FiUser />}
                                                </div>
                                                <div>
                                                    <p className="font-bold">{user.name}</p>
                                                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-secondary/20 text-secondary' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'}`}>
                                                    {user.isActive ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="p-3">{format(new Date(user.createdAt), 'MM/dd/yyyy')}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openEditModal(user)} title="Edit Role" className="p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-full"><FiEdit /></button>
                                                    <button onClick={() => handleToggleStatus(user._id, user.isActive)} title={user.isActive ? "Disable User" : "Enable User"} disabled={user._id === adminUser._id}>
                                                        {user.isActive ? <FiToggleLeft className="text-2xl text-red-500 disabled:opacity-20" /> : <FiToggleRight className="text-2xl text-primary disabled:opacity-20" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <UserForm 
                    onSubmit={handleCreateUser}
                    onCancel={() => setIsCreateModalOpen(false)}
                    loading={formLoading}
                />
            </Modal>
            
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <UserForm 
                    initialData={selectedUser}
                    onSubmit={handleEditRole}
                    onCancel={() => setIsEditModalOpen(false)}
                    loading={formLoading}
                />
            </Modal>
        </>
    );
};

export default UserManagementPage;