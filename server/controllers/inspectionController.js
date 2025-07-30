// server/controllers/inspectionController.js
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Inspection from '../models/Inspection.js';
import Vehicle from '../models/Vehicle.js';
import Notification from '../models/Notification.js';
import { differenceInDays } from 'date-fns';

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
        // --- THIS IS THE CORRECTED LOGIC ---
        // Save the logged-in user's ID to the 'inspector' field.
        inspector: req.user._id, 
        result,
        notes,
        next_due_date,
    });

    const createdInspection = await inspection.save();

    // The immediate notification logic
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

const getInspectionsForVehicle = asyncHandler(async (req, res) => {
    const vehicleId = new mongoose.Types.ObjectId(req.params.vehicleId);
    const inspections = await Inspection.aggregate([
        { $match: { vehicle: vehicleId } },
        { $lookup: { from: 'users', localField: 'inspector', foreignField: '_id', as: 'inspectorDetails' } },
        { $unwind: { path: "$inspectorDetails", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1, date: 1, result: 1, notes: 1, next_due_date: 1,
                inspector: {
                    _id: { $ifNull: ["$inspectorDetails._id", null] },
                    name: { $ifNull: ["$inspectorDetails.name", "Unknown Inspector"] }
                }
            }
        },
        { $sort: { date: -1 } }
    ]);
    res.json(inspections);
});

export { createInspection, getInspectionsForVehicle };