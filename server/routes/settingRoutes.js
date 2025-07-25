import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingController.js';

const router = express.Router();
router.use(protect, admin);

router.route('/').get(getSettings).put(updateSettings);

export default router;