// server/routes/inspectionRoutes.js
import express from 'express';
const router = express.Router();
import { createInspection, getInspectionsForVehicle } from '../controllers/inspectionController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').post(protect, createInspection);
router.route('/vehicle/:vehicleId').get(protect, getInspectionsForVehicle);

export default router;