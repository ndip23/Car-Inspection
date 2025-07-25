// server/routes/authRoutes.js
import express from 'express';
const router = express.Router();
import { loginUser, registerUser } from '../controllers/authController.js';

router.post('/login', loginUser);
router.post('/register', registerUser); // For initial setup

export default router;