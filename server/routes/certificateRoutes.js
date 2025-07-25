// server/routes/certificateRoutes.js
import express from 'express';
const router = express.Router();
import { generateCertificate } from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/:inspectionId', protect, generateCertificate);

export default router;