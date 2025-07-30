// server/controllers/adminController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Inspection from '../models/Inspection.js';
import Notification from '../models/Notification.js';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, subYears } from 'date-fns';

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
    const devEmail = process.env.DEFAULT_DEV_EMAIL; // Get the developer email from .env

    // Create a filter object. If the devEmail is set, exclude it from the results.
    const filter = devEmail ? { email: { $ne: devEmail } } : {};

    const users = await User.find(filter).select('-password');
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

const sendAllPendingReminders = asyncHandler(async (req, res) => {
    // 1. Find all notifications that are ready to be sent.
    const pendingNotifications = await Notification.find({ status: 'pending' }).populate('vehicle');

    if (pendingNotifications.length === 0) {
        return res.json({ message: 'No pending reminders to send.' });
    }

    let successCount = 0;
    let failureCount = 0;

    // 2. Loop through each notification and attempt to send.
    for (const notification of pendingNotifications) {
        let emailSuccess = false;
        let smsSuccess = false;
        const { vehicle } = notification;

        // Skip if for some reason the vehicle was deleted.
        if (!vehicle) {
            failureCount++;
            continue;
        }

        // Attempt to send email
        emailSuccess = await sendEmailReminder(
            vehicle.owner_email,
            vehicle.owner_name,
            vehicle.license_plate,
            notification.dueDate
        );

        // Attempt to send SMS
        const formattedDate = format(new Date(notification.dueDate), 'MMMM do, yyyy');
        const smsMessage = `Dear ${vehicle.owner_name}, your vehicle ${vehicle.license_plate} is due for inspection on ${formattedDate}. -VisuTech`;
        smsSuccess = await sendLocalSmsReminder(vehicle.owner_phone, smsMessage);

        // 3. If either was successful, update the notification status.
        if (emailSuccess || smsSuccess) {
            successCount++;
            notification.status = 'sent';
            notification.sentAt = new Date();
            await notification.save();
        } else {
            failureCount++;
        }
    }

    // 4. Return a summary of the operation.
    res.json({
        message: 'Processing complete.',
        successCount,
        failureCount,
        total: pendingNotifications.length
    });
});
// @desc    Get lapsed customers (vehicles not seen in 2 years)
// @route   GET /api/admin/reports/lapsed-customers
// @access  Private/Admin
const getLapsedCustomersReport = asyncHandler(async (req, res) => {
    // 1. Define the cutoff date: exactly 2 years ago from today.
    const twoYearsAgo = subYears(new Date(), 2);

    const lapsedVehicles = await Inspection.aggregate([
        // Stage 1: Get the most recent inspection date for every vehicle.
        {
            $group: {
                _id: "$vehicle",
                lastInspectionDate: { $max: "$date" }
            }
        },
        // Stage 2: Filter this list to only include vehicles whose last inspection
        // was *before* our 2-year cutoff date.
        {
            $match: {
                lastInspectionDate: { $lt: twoYearsAgo }
            }
        },
        // Stage 3: Join with the vehicles collection to get owner details.
        {
            $lookup: {
                from: "vehicles",
                localField: "_id",
                foreignField: "_id",
                as: "vehicleDetails"
            }
        },
        { $unwind: "$vehicleDetails" },
        // Stage 4: Sort by the oldest last inspection date.
        { $sort: { lastInspectionDate: 1 } },
        // Stage 5: Format the output.
        {
            $project: {
                _id: 0,
                vehicleId: "$vehicleDetails._id",
                license_plate: "$vehicleDetails.license_plate",
                owner_name: "$vehicleDetails.owner_name",
                owner_phone: "$vehicleDetails.owner_phone",
                owner_email: "$vehicleDetails.owner_email",
                lastInspectionDate: 1,
            }
        }
    ]);

    res.json(lapsedVehicles);
});

// @desc    Get loyal customers (vehicles with the most inspections)
// @route   GET /api/admin/reports/loyal-customers
// @access  Private/Admin
const getLoyalCustomersReport = asyncHandler(async (req, res) => {
    const loyalVehicles = await Inspection.aggregate([
        // Stage 1: Group by vehicle and count the number of inspections for each.
        {
            $group: {
                _id: "$vehicle",
                inspectionCount: { $sum: 1 }
            }
        },
        // Stage 2: Sort by the highest count first.
        { $sort: { inspectionCount: -1 } },
        // Stage 3: Limit to the top 20 most loyal customers.
        { $limit: 20 },
        // Stage 4: Join with the vehicles collection to get owner details.
        {
            $lookup: {
                from: "vehicles",
                localField: "_id",
                foreignField: "_id",
                as: "vehicleDetails"
            }
        },
        { $unwind: "$vehicleDetails" },
        // Stage 5: Format the output.
        {
            $project: {
                _id: 0,
                vehicleId: "$vehicleDetails._id",
                license_plate: "$vehicleDetails.license_plate",
                owner_name: "$vehicleDetails.owner_name",
                owner_phone: "$vehicleDetails.owner_phone",
                owner_email: "$vehicleDetails.owner_email",
                inspectionCount: 1,
            }
        }
    ]);

    res.json(loyalVehicles);
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
    getInspectorPerformance,
    sendAllPendingReminders, 
    getLapsedCustomersReport,
    getLoyalCustomersReport
};