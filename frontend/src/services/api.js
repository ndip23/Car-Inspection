// frontend/src/services/api.js
import axios from 'axios';

const API = axios.create({ 
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' 
});

// Add JWT to every request if user is logged in
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

// Authentication
export const loginUser = async (email, password) => { // Renamed from mockLogin
    const { data } = await API.post('/auth/login', { email, password });
    return data;
};

// NEW: Add the register function
export const registerUser = async (userData) => {
    const { data } = await API.post('/auth/register', userData);
    return data;
};


// Vehicles
export const fetchVehicles = (searchTerm = "") => API.get(`/vehicles?search=${searchTerm}`).then(res => res.data);
export const fetchVehicleById = (id) => API.get(`/vehicles/${id}`).then(res => res.data);
export const createVehicle = (vehicleData) => API.post('/vehicles', vehicleData).then(res => res.data);
// Inspections
export const fetchInspectionsByVehicleId = (vehicleId) => API.get(`/inspections/vehicle/${vehicleId}`).then(res => res.data);
export const createInspection = (inspectionData) => API.post('/inspections', inspectionData).then(res => res.data);
export const updateUserProfile = (userData) => API.put('/users/profile', userData);
export const updateUserAvatar = (formData) => API.put('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const changePassword = (passwordData) => API.put('/users/password', passwordData);
export const deleteAccount = (passwordData) => API.delete('/users/profile', { data: passwordData });
export const fetchNotifications = () => API.get('/notifications');
export const sendNotificationEmail = (id) => API.post(`/notifications/${id}/send`);
export const acknowledgeNotification = (id) => API.put(`/notifications/${id}/acknowledge`);
export const fetchReport = (period) => API.get(`/reports?period=${period}`);
export const sendManualReminder = (vehicleId) => API.post(`/vehicles/${vehicleId}/remind`);
//admnin stuffs
export const fetchAdminStats = () => API.get('/admin/stats');
export const fetchAllUsers = () => API.get('/admin/users');
export const updateUserRole = (userId, role) => API.put(`/admin/users/${userId}/role`, { role });
export const adminCreateUser = (userData) => API.post('/admin/users', userData);
export const toggleUserStatus = (userId) => API.put(`/admin/users/${userId}/status`);
export const fetchInspectorPerformance = () => API.get('/admin/performance');
export const fetchSettings = () => API.get('/settings');
export const updateSettings = (settingsData) => API.put('/settings', settingsData);
export const sendAllPendingReminders = () => API.post('/admin/notifications/send-all');