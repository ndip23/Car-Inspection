import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingController.js';

const router = express.Router();
router.route('/').get(protect, getSettings);
router.route('/').put(protect, admin, updateSettings);

export default router;