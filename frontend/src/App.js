// frontend/src/App.js
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import "react-datepicker/dist/react-datepicker.css";
import { NotificationProvider } from './context/NotificationContext';

// Layouts and Route Handlers
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
// REMOVED: import DeveloperRoute from './components/DeveloperRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VehicleDetails from './pages/VehicleDetails';
import NewInspection from './pages/NewInspection';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import NotFound from './pages/NotFound';
import DeveloperPanel from './pages/DeveloperPanel';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
//import VehicleDatabasePage from './pages/admin/VehicleDatabasePage';
import InspectorPerformancePage from './pages/admin/InspectorPerformancePage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';
import CustomerReportsPage from './pages/admin/CustomerReportsPage';

function App() {
  const { loading } = useAuth();
  if (loading) { return <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg"><p>Loading application...</p></div> }
  
  return (
    <> 
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagementPage />} />
                 {/*<Route path="vehicles" element={<VehicleDatabasePage />} />*/}
                <Route path="performance" element={<InspectorPerformancePage />} />
                <Route path="settings" element={<SystemSettingsPage />} />
                <Route path="customer-reports" element={<CustomerReportsPage />} />
            </Route>
        </Route>
        
        {/* Standard User and Developer Routes */}
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<ProfileSettingsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="vehicle/:id" element={<VehicleDetails />} />
          <Route path="vehicle/:id/new-inspection" element={<NewInspection />} />
          {/* --- NEW, SIMPLIFIED DEVELOPER ROUTE --- */}
          {/* It's now just a regular protected route inside the main layout */}
          <Route path="developer-panel" element={<DeveloperPanel />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const AppWrapper = () => (
    <Router>
        <ThemeProvider>
            <AuthProvider>
               <NotificationProvider>
                <App />
                </NotificationProvider>
            </AuthProvider>
        </ThemeProvider>
    </Router>
);
export default AppWrapper;