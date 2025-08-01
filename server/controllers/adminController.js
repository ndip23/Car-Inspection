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
// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const { startDate: startDateQuery, endDate: endDateQuery } = req.query;

    const now = new Date();
    // These functions (parseISO, startOfMonth, etc.) will now be defined.
    const startOfMonthFilter = startDateQuery ? parseISO(startDateQuery) : startOfMonth(now);
    const endOfMonthFilter = endDateQuery ? parseISO(endDateQuery) : endOfMonth(now);

    const devEmail = process.env.DEFAULT_DEV_EMAIL;
    const userFilter = devEmail ? { email: { $ne: devEmail } } : {};
    
    const totalUsers = await User.countDocuments(userFilter);
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
    
    const inspectionsByDay = await Inspection.aggregate([
        { $match: { date: { $gte: startOfWeekFilter, $lte: endOfWeekFilter } } },
        { $group: { _id: { $dayOfWeek: "$date" }, count: { $sum: 1 } } }
    ]);
    
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => (i + 2 > 7 ? 1 : i + 2)); // Mon=2, ..., Sun=1
    const chartData = daysOfWeek.map(day => {
        const match = inspectionsByDay.find(d => d._id === day);
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

// @desc    Get inspector performance statistics
// @route   GET /api/admin/performance
// @access  Private/Admin
const getInspectorPerformance = asyncHandler(async (req, res) => {
    const performance = await Inspection.aggregate([
        // Stage 1: Use $lookup to join with the users collection.
        // This is like a LEFT JOIN in SQL.
        {
            $lookup: {
                from: "users", // The name of the users collection in MongoDB
                localField: "inspector", // The field in the 'inspections' collection
                foreignField: "_id", // The field in the 'users' collection
                as: "inspectorDetails" // The name for the new array field that holds the joined user document
            }
        },
        // Stage 2: Deconstruct the inspectorDetails array.
        // If an inspection has an inspector that was deleted, this will filter it out.
        // Use { preserveNullAndEmptyArrays: true } if you want to see "Unknown" inspectors.
        { $unwind: "$inspectorDetails" },
        // Stage 3: Group the documents by the inspector's name.
        {
            $group: {
                _id: "$inspectorDetails.name", // Group by the actual user's name
                totalInspections: { $sum: 1 }, // Count the total documents in each group
                // Count how many in each group have the result 'accepted'
                accepted: { $sum: { $cond: [{ $eq: ["$result", "pass"] }, 1, 0] } },
                // Count how many in each group have the result 'rejected'
                rejected: { $sum: { $cond: [{ $eq: ["$result", "fail"] }, 1, 0] } },
            },
        },
        // Stage 4: Sort the results by the total number of inspections in descending order.
        { $sort: { totalInspections: -1 } },
        // Stage 5: Reshape the output to be clean and user-friendly for the frontend.
        {
            $project: {
                _id: 0, // Exclude the default _id field
                inspectorName: "$_id", // Rename _id to inspectorName
                totalInspections: 1, // Include totalInspections
                passed: "$accepted", // Rename accepted to passed
                failed: "$rejected", // Rename rejected to failed
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
const getLapsedCustomersReport = asyncHandler(async (req, res) => {
    const twoYearsAgo = subYears(new Date(), 2);
    const lapsedVehicles = await Inspection.aggregate([
        { $group: { _id: "$vehicle", lastInspectionDate: { $max: "$date" } } },
        { $match: { lastInspectionDate: { $lt: twoYearsAgo } } },
        { $lookup: { from: "vehicles", localField: "_id", foreignField: "_id", as: "vehicleDetails" } },
        { $unwind: "$vehicleDetails" },
        { $sort: { lastInspectionDate: 1 } },
        {
            $project: {
                _id: 0,
                vehicleId: "$vehicleDetails._id",
                license_plate: "$vehicleDetails.license_plate",
                // Corrected field names
                customer_name: "$vehicleDetails.customer_name",
                customer_phone: "$vehicleDetails.customer_phone",
                customer_email: "$vehicleDetails.customer_email",
                lastInspectionDate: 1,
            }
        }
    ]);
    res.json(lapsedVehicles);
});

// --- THIS IS THE FINAL, CORRECTED LOYAL CUSTOMERS FUNCTION ---
const getLoyalCustomersReport = asyncHandler(async (req, res) => {
    const loyalVehicles = await Inspection.aggregate([
        { $group: { _id: "$vehicle", inspectionCount: { $sum: 1 } } },
        { $sort: { inspectionCount: -1 } },
        { $limit: 20 },
        { $lookup: { from: "vehicles", localField: "_id", foreignField: "_id", as: "vehicleDetails" } },
        { $unwind: "$vehicleDetails" },
        {
            $project: {
                _id: 0,
                vehicleId: "$vehicleDetails._id",
                license_plate: "$vehicleDetails.license_plate",
                // Corrected field names
                customer_name: "$vehicleDetails.customer_name",
                customer_phone: "$vehicleDetails.customer_phone",
                customer_email: "$vehicleDetails.customer_email",
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