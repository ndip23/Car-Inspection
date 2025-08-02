// server/routes/adminRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
    getDashboardStats, 
    getAllUsers, 
    updateUserRole,
    adminCreateUser,
    toggleUserStatus,
    getAllVehicles,
    adminUpdateVehicle,
    adminDeleteVehicle,
    getInspectorPerformance,
    getLapsedCustomersReport,
    getLoyalCustomersReport
} from '../controllers/adminController.js';

const router = express.Router();

// This middleware applies to ALL routes defined in this file
router.use(protect, admin);

// --- Main Admin Routes ---
router.get('/stats', getDashboardStats);

// --- User Management Routes ---
router.route('/users')
    .get(getAllUsers)
    .post(adminCreateUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);

// --- Vehicle Management Routes ---
router.route('/vehicles')
    .get(getAllVehicles);
router.route('/vehicles/:id')
    .put(adminUpdateVehicle)
    .delete(adminDeleteVehicle);

// --- Performance Report Route ---
router.get('/performance', getInspectorPerformance);

// --- THIS IS THE CORRECTED CUSTOMER REPORT ROUTES ---
// The routes should be defined like this, matching the controller logic.
router.get('/reports/lapsed-customers', getLapsedCustomersReport);
router.get('/reports/loyal-customers', getLoyalCustomersReport);
// ----------------------------------------------------

export default router;