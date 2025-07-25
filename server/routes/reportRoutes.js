// server/routes/reportRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getInspectionReport } from '../controllers/reportController.js';

const router = express.Router();

router.route('/').get(protect, getInspectionReport);

export default router;