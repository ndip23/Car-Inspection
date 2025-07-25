// server/controllers/inspectionController.js
import asyncHandler from 'express-async-handler';
import Inspection from '../models/Inspection.js';
import Vehicle from '../models/Vehicle.js';
// REMOVED: `addMonths` is no longer needed here
// import { addMonths } from 'date-fns';

// @desc    Create a new inspection
// @route   POST /api/inspections
// @access  Private/Inspector
const createInspection = asyncHandler(async (req, res) => {
    // UPDATED: Now we expect `next_due_date` from the request body
    const { vehicleId, result, notes, next_due_date } = req.body;

    // Validate that the required fields are present
    if (!vehicleId || !result || !next_due_date) {
        res.status(400);
        throw new Error('Please provide all required inspection fields: vehicle, result, and next due date.');
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
        res.status(404);
        throw new Error('Vehicle not found');
    }

    // REMOVED: The automatic due date calculation is gone.

    const inspection = new Inspection({
        vehicle: vehicleId,
        date: new Date(), // The inspection date is still `now`
        inspector_name: req.user.name,
        result,
        notes,
        next_due_date, // Use the date provided by the user from the frontend
    });

    const createdInspection = await inspection.save();
    res.status(201).json(createdInspection);
});

// @desc    Get all inspections for a specific vehicle
// @route   GET /api/inspections/vehicle/:vehicleId
// @access  Private/Inspector
const getInspectionsForVehicle = asyncHandler(async (req, res) => {
    const inspections = await Inspection.find({ vehicle: req.params.vehicleId }).sort({ date: -1 });
    res.json(inspections);
});

export { createInspection, getInspectionsForVehicle };