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

    const inspections = await Inspection.find({
        date: { $gte: startDate, $lte: endDate }
    })
    .populate('vehicle', 'license_plate')
    .populate('inspector', 'name') // This is the correct way to populate
    .sort({ date: -1 });
    res.json(inspections);
});

export { getInspectionReport };