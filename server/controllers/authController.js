// server/controllers/authController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import jwt from 'jsonwebtoken'; // Import jwt directly

// Self-contained utility to generate a token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Step 1: Find the user by email.
  const user = await User.findOne({ email });

  // If no user is found, or if the user's account is disabled, send an error.
  if (!user || !user.isActive) {
    res.status(401); // Unauthorized
    throw new Error('Invalid credentials or account disabled.');
  }

  // --- THIS IS THE FIX ---
  // Step 2: Explicitly await the password comparison in its own variable.
  const isMatch = await user.matchPassword(password);

  // Step 3: Check the result of the comparison.
  if (isMatch) {
    // If the passwords match, send back the user data and token.
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      token: generateToken(user._id),
    });
  } else {
    // If the passwords do NOT match, send the error.
    res.status(401); // Unauthorized
    throw new Error('Invalid email or password');
  }
  // ------------------------------------
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    // --- SECURITY FIX ---
    // We ONLY accept name, email, and password. The role is set by the server.
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: 'inspector', // Public registrations are ALWAYS inspectors.
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isActive: user.isActive,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

export { loginUser, registerUser };