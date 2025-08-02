// server/controllers/reportController.js
import asyncHandler from 'express-async-handler';
import Inspection from '../models/Inspection.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// @desc    Get inspection reports based on a time period
// @route   GET /api/reports?period=daily|weekly|monthly
// @access  Private
const getInspectionReport = asyncHandler(async (req, res) => {
    const { period } = req.query;
    const now = new Date();
    let startDate, endDate;

    switch (period) {
        case 'daily':
            startDate = startOfDay(now);
            endDate = endOfDay(now);
            break;
        case 'weekly':
            startDate = startOfWeek(now, { weekStartsOn: 1 });
            endDate = endOfWeek(now, { weekStartsOn: 1 });
            break;
        case 'monthly':
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
        default:
            startDate = startOfDay(now);
            endDate = endOfDay(now);
    }

    // --- THIS IS THE CORRECTED QUERY ---
    const inspections = await Inspection.find({
        date: { $gte: startDate, $lte: endDate }
    })
    // 1. Populate the 'vehicle' details.
    .populate('vehicle', 'license_plate category vehicle_type')
    // 2. CRITICAL FIX: Also populate the 'inspector' details, selecting only their name.
    .populate('inspector', 'name')
    .sort({ date: -1 });
    // ------------------------------------

    res.json(inspections);
});

export { getInspectionReport };