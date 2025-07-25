import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getNotifications, sendNotification, acknowledgeNotification } from '../controllers/notificationController.js';

const router = express.Router();

router.route('/').get(protect, getNotifications);
router.route('/:id/send').post(protect, sendNotification); // Use POST for sending
router.route('/:id/acknowledge').put(protect, acknowledgeNotification);

export default router;