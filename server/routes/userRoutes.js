// server/routes/userRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { updateUserProfile, updateUserProfilePicture, changeUserPassword, deleteUserAccount } from '../controllers/userController.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.route('/profile').put(protect, updateUserProfile);
router.route('/avatar').put(protect, upload.single('avatar'), updateUserProfilePicture);
router.put('/password', protect, changeUserPassword);
router.delete('/profile', protect, deleteUserAccount);

export default router;