// server/controllers/adminController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Inspection from '../models/Inspection.js';
import Notification from '../models/Notification.js';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const { startDate: startDateQuery, endDate: endDateQuery } = req.query;
    const now = new Date();
    const startOfMonthFilter = startDateQuery ? parseISO(startDateQuery) : startOfMonth(now);
    const endOfMonthFilter = endDateQuery ? parseISO(endDateQuery) : endOfMonth(now);

    const totalUsers = await User.countDocuments();
    const totalVehicles = await Vehicle.countDocuments();
    
    const inspectionsInRange = await Inspection.countDocuments({
        date: { $gte: startOfMonthFilter, $lte: endOfMonthFilter }
    });
    const passedInRange = await Inspection.countDocuments({
        date: { $gte: startOfMonthFilter, $lte: endOfMonthFilter },
        result: 'pass'
    });

    const startOfWeekFilter = startOfWeek(now, { weekStartsOn: 1 });
    const endOfWeekFilter = endOfWeek(now, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: startOfWeekFilter, end: endOfWeekFilter });

    const inspectionsByDay = await Inspection.aggregate([
        { $match: { date: { $gte: startOfWeekFilter, $lte: endOfWeekFilter } } },
        { 
            $group: {
                _id: { $dayOfWeek: "$date" },
                count: { $sum: 1 }
            }
        }
    ]);

    const chartData = daysInWeek.map((day) => {
        const mongoDayOfWeek = (day.getDay() === 0) ? 7 : day.getDay();
        const match = inspectionsByDay.find(d => d._id === (mongoDayOfWeek));
        return match ? match.count : 0;
    });

    res.json({
        totalUsers,
        totalVehicles,
        inspectionsInRange,
        passFailRatio: inspectionsInRange > 0 ? (passedInRange / inspectionsInRange) * 100 : 0,
        chartData
    });
});

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!role || !['inspector', 'admin'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role specified.');
    }
    const user = await User.findById(req.params.id);
    if (user) {
        user.role = role;
        await user.save();
        res.json({ message: 'User role updated successfully.' });
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

// @desc    Admin creates a new user
// @route   POST /api/admin/users
// @access  Private/Admin
const adminCreateUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists.');
    }
    const user = await User.create({ name, email, password, role });
    if (user) {
        res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
    } else {
        res.status(400);
        throw new Error('Invalid user data.');
    }
});

// @desc    Toggle a user's active status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        if (user._id.equals(req.user._id)) {
            res.status(400);
            throw new Error('You cannot disable your own account.');
        }
        user.isActive = !user.isActive;
        await user.save();
        res.json({ message: `User has been ${user.isActive ? 'enabled' : 'disabled'}.` });
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

// @desc    Get all vehicles for admin panel
// @route   GET /api/admin/vehicles
// @access  Private/Admin
const getAllVehicles = asyncHandler(async (req, res) => {
    const vehicles = await Vehicle.find({}).sort({ createdAt: -1 });
    res.json(vehicles);
});

// @desc    Admin updates a vehicle
// @route   PUT /api/admin/vehicles/:id
// @access  Private/Admin
const adminUpdateVehicle = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
        res.status(404);
        throw new Error('Vehicle not found');
    }
    vehicle.license_plate = req.body.license_plate || vehicle.license_plate;
    vehicle.category = req.body.category || vehicle.category;
    vehicle.vehicle_type = req.body.vehicle_type || vehicle.vehicle_type;
    vehicle.owner_name = req.body.owner_name || vehicle.owner_name;
    vehicle.owner_phone = req.body.owner_phone || vehicle.owner_phone;
    vehicle.owner_whatsapp = req.body.owner_whatsapp || vehicle.owner_whatsapp;
    vehicle.owner_email = req.body.owner_email || vehicle.owner_email;
    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
});

// @desc    Admin deletes a vehicle and all related data
// @route   DELETE /api/admin/vehicles/:id
// @access  Private/Admin
const adminDeleteVehicle = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
        res.status(404);
        throw new Error('Vehicle not found');
    }
    await Inspection.deleteMany({ vehicle: vehicle._id });
    await Notification.deleteMany({ vehicle: vehicle._id });
    await vehicle.deleteOne();
    res.json({ message: 'Vehicle and all associated data have been removed.' });
});

// --- NEW FUNCTION TO ADD ---
// @desc    Get inspector performance statistics
// @route   GET /api/admin/performance
// @access  Private/Admin
const getInspectorPerformance = asyncHandler(async (req, res) => {
    const performance = await Inspection.aggregate([
        {
            $group: {
                _id: "$inspector_name",
                totalInspections: { $sum: 1 },
                passed: { $sum: { $cond: [{ $eq: ["$result", "pass"] }, 1, 0] } },
                failed: { $sum: { $cond: [{ $eq: ["$result", "fail"] }, 1, 0] } },
            },
        },
        { $sort: { totalInspections: -1 } },
        {
            $project: {
                _id: 0,
                inspectorName: "$_id",
                totalInspections: 1,
                passed: 1,
                failed: 1,
            }
        }
    ]);
    res.json(performance);
});

export { 
    getDashboardStats, 
    getAllUsers, 
    updateUserRole, 
    adminCreateUser, 
    toggleUserStatus,
    getAllVehicles,
    adminUpdateVehicle,
    adminDeleteVehicle,
    getInspectorPerformance 
};