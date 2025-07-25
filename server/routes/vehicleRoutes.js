// server/routes/vehicleRoutes.js
import express from 'express';
const router = express.Router();
import { createVehicle, getVehicles, getVehicleById, sendManualReminder } from '../controllers/vehicleController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').post(protect, createVehicle).get(protect, getVehicles);
router.route('/:id').get(protect, getVehicleById);
router.route('/:id/remind').post(protect, sendManualReminder);

export default router;