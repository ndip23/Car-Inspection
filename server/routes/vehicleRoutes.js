// server/routes/vehicleRoutes.js
import express from 'express';
const router = express.Router();
import { createVehicle, getVehicles, getVehicleById, sendManualReminder } from '../controllers/vehicleController.js';
import { protect } from '../middleware/authMiddleware.js';
import checkLicense from '../middleware/licenseMiddleware.js'; // <-- IMPORT a

// Apply license check only to the routes that need it
router.route('/').post(protect, checkLicense, createVehicle).get(protect, getVehicles);
router.route('/:id').get(protect, getVehicleById);
router.post('/:id/remind', protect, checkLicense, sendManualReminder);

export default router;