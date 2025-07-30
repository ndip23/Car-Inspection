// server/routes/authRoutes.js
import express from 'express';
import rateLimit from 'express-rate-limit'; // Import the package
import { loginUser, registerUser } from '../controllers/authController.js';

const router = express.Router();

// --- NEW: Create a rate limiter for authentication routes ---
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login/register requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { message: 'Too many attempts from this IP, please try again after 15 minutes' },
});
// -----------------------------------------------------------

// Apply the limiter to both the login and register routes
router.post('/login', authLimiter, loginUser);
router.post('/register', authLimiter, registerUser);

export default router;