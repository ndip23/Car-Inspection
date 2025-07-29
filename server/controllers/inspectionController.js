// server/controllers/inspectionController.js
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose'; // Import mongoose to use its ObjectId
import Inspection from '../models/Inspection.js';
import Vehicle from '../models/Vehicle.js';
import Notification from '../models/Notification.js';
import { differenceInDays } from 'date-fns';

// createInspection function is already correct and remains the same
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
    const daysUntilDue = differenceInDays(new Date(next_due_date), new Date());
    if (daysUntilDue >= 0 && daysUntilDue <= 7) {
        const existingNotification = await Notification.findOne({ inspection: createdInspection._id });
        if (!existingNotification) {
            await Notification.create({
                vehicle: vehicle._id,
                inspection: createdInspection._id,
                dueDate: createdInspection.next_due_date,
                message: `Inspection for ${vehicle.license_plate} is due on ${new Date(createdInspection.next_due_date).toLocaleDateString()}.`,
                status: 'pending',
            });
        }
    }
    res.status(201).json(createdInspection);
});


// --- THIS IS THE NEW, ROBUST FUNCTION ---
// @desc    Get all inspections for a specific vehicle
// @route   GET /api/inspections/vehicle/:vehicleId
// @access  Private
const getInspectionsForVehicle = asyncHandler(async (req, res) => {
    try {
        const vehicleId = new mongoose.Types.ObjectId(req.params.vehicleId);

        const inspections = await Inspection.aggregate([
            // Stage 1: Find all inspections for the given vehicle
            { $match: { vehicle: vehicleId } },
            // Stage 2: Join with the 'users' collection (for inspector details)
            {
                $lookup: {
                    from: 'users',
                    localField: 'inspector',
                    foreignField: '_id',
                    as: 'inspectorDetails'
                }
            },
            // Stage 3: Deconstruct the array created by $lookup
            // Using 'preserveNullAndEmptyArrays' ensures that inspections with
            // a missing or deleted inspector are NOT dropped from the results.
            { $unwind: { path: "$inspectorDetails", preserveNullAndEmptyArrays: true } },
            // Stage 4: Reshape the output to be exactly what the frontend expects
            {
                $project: {
                    _id: 1,
                    date: 1,
                    result: 1,
                    notes: 1,
                    next_due_date: 1,
                    // Create an 'inspector' object. If details exist, use them.
                    // Otherwise, create a default "Unknown Inspector" object.
                    inspector: {
                        _id: { $ifNull: ["$inspectorDetails._id", null] },
                        name: { $ifNull: ["$inspectorDetails.name", "Unknown Inspector"] }
                    }
                }
            },
            // Stage 5: Sort by date, descending
            { $sort: { date: -1 } }
        ]);

        res.json(inspections);
    } catch (error) {
        res.status(500);
        throw new Error('Failed to fetch inspection history.');
    }
});
// ------------------------------------------

export { createInspection, getInspectionsForVehicle };