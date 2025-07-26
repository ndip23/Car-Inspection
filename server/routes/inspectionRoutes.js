// server/routes/inspectionRoutes.js
import express from 'express';
const router = express.Router();
import { createInspection, getInspectionsForVehicle } from '../controllers/inspectionController.js';
import { protect } from '../middleware/authMiddleware.js';
import checkLicense from '../middleware/licenseMiddleware.js'; // <-- IMPORT

// Apply license check only to the routes that need it
router.route('/').post(protect, checkLicense, createInspection);
router.route('/vehicle/:vehicleId').get(protect, getInspectionsForVehicle);

export default router;