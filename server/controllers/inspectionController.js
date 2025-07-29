// server/controllers/inspectionController.js
import asyncHandler from 'express-async-handler';
import Inspection from '../models/Inspection.js';
import Vehicle from '../models/Vehicle.js';
import Notification from '../models/Notification.js'; // <-- IMPORT THE NOTIFICATION MODEL
import { differenceInDays } from 'date-fns';

// @desc    Create a new inspection
// @route   POST /api/inspections
// @access  Private/Inspector
const createInspection = asyncHandler(async (req, res) => {
    const { vehicleId, result, notes, next_due_date } = req.body;

    if (!vehicleId || !result || !next_due_date) {
        res.status(400);
        throw new Error('Please provide all required inspection fields.');
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        res.status(404);
        throw new Error('Vehicle not found');
    }

    const inspection = new Inspection({
        vehicle: vehicleId,
        date: new Date(),
        inspector: req.user._id,
        result,
        notes,
        next_due_date,
    });

    const createdInspection = await inspection.save();

    // --- THIS IS THE NEW, IMMEDIATE NOTIFICATION LOGIC ---
    // After saving the inspection, check if a notification should be created right away.
    const daysUntilDue = differenceInDays(new Date(next_due_date), new Date());

    // We'll use a 7-day window, just like the cron job.
    if (daysUntilDue >= 0 && daysUntilDue <= 7) {
        // Check if a notification for this specific inspection already exists to be safe.
        const existingNotification = await Notification.findOne({ inspection: createdInspection._id });
        if (!existingNotification) {
            console.log(`IMMEDIATE CHECK: Creating notification for vehicle ${vehicle.license_plate}`);
            await Notification.create({
                vehicle: vehicle._id,
                inspection: createdInspection._id,
                dueDate: createdInspection.next_due_date,
                message: `Inspection for ${vehicle.license_plate} is due on ${new Date(createdInspection.next_due_date).toLocaleDateString()}.`,
                status: 'pending',
            });
        }
    }
    // ----------------------------------------------------

    res.status(201).json(createdInspection);
});

// @desc    Get all inspections for a specific vehicle
// @route   GET /api/inspections/vehicle/:vehicleId
// @access  Private/Inspector
const getInspectionsForVehicle = asyncHandler(async (req, res) => {
    const inspections = await Inspection.find({ vehicle: req.params.vehicleId })
        .populate('inspector', 'name')
        .sort({ date: -1 });
    res.json(inspections);
});

export { createInspection, getInspectionsForVehicle };