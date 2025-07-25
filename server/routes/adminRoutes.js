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
    getInspectorPerformance // --- IMPORT THE NEW CONTROLLER ---
} from '../controllers/adminController.js';

const router = express.Router();
router.use(protect, admin);

router.get('/stats', getDashboardStats);

// User routes
router.route('/users').get(getAllUsers).post(adminCreateUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);

// Vehicle routes
router.route('/vehicles').get(getAllVehicles);
router.route('/vehicles/:id').put(adminUpdateVehicle).delete(adminDeleteVehicle);

// --- ADD THE NEW PERFORMANCE ROUTE ---
router.get('/performance', getInspectorPerformance);

export default router;