// server/controllers/userController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js'; // You might need to create this file if you haven't

// @desc    Update user profile (name, email)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile picture
// @route   PUT /api/users/avatar
// @access  Private
const updateUserProfilePicture = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file');
    }

    const user = await User.findById(req.user._id);
    if (user) {
        user.avatar = req.file.path; // URL from Cloudinary
        const updatedUser = await user.save();
         res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
const changeUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide old and new passwords');
    }

    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(oldPassword))) {
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(401);
        throw new Error('Invalid old password');
    }
});


// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!password) {
        res.status(400);
        throw new Error('Password is required for confirmation');
    }
    
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(password))) {
        await user.deleteOne(); 
        // Note: In a real app, you might want to also delete related data (inspections, etc.)
        res.json({ message: 'Account deleted successfully' });
    } else {
        res.status(401);
        throw new Error('Invalid password, account deletion failed');
    }
});

export { updateUserProfile, updateUserProfilePicture, changeUserPassword, deleteUserAccount };