// frontend/src/App.js
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import "react-datepicker/dist/react-datepicker.css";

// Layouts and Route Handlers
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';

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
// Developer Panel
import DeveloperRoute from './components/DeveloperRoute'; 
import DeveloperPanel from './pages/DeveloperPanel';
import { DeveloperAuthProvider } from './context/DeveloperAuthContext';
import DeveloperLogin from './pages/DeveloperLogin';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
//import VehicleDatabasePage from './pages/admin/VehicleDatabasePage';
import InspectorPerformancePage from './pages/admin/InspectorPerformancePage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage'; // --- IMPORT THE SETTINGS PAGE ---

function App() {
  const { loading } = useAuth();
  if (loading) { return <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg"><p>Loading application...</p></div> }
  return (
    <> 
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
         <Route element={<DeveloperRoute />}>
          <Route path="/developer-panel" element={<DashboardLayout><DeveloperPanel /></DashboardLayout>} />
        </Route>
        
        {/* --- ADMIN ROUTES SECTION --- */}
        <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagementPage />} />
                 {/*<Route path="vehicles" element={<VehicleDatabasePage />} />*/}
                <Route path="performance" element={<InspectorPerformancePage />} />
                <Route path="settings" element={<SystemSettingsPage />} /> {/* --- ADD THE SETTINGS ROUTE --- */}
            </Route>
        </Route>
        
        {/* Standard User Routes */}
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<ProfileSettingsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="vehicle/:id" element={<VehicleDetails />} />
          <Route path="vehicle/:id/new-inspection" element={<NewInspection />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const AppWrapper = () => ( <Router> <ThemeProvider> <AuthProvider> <DeveloperAuthProvider> 
                    <App />
                </DeveloperAuthProvider> </AuthProvider> </ThemeProvider> </Router> );
export default AppWrapper;