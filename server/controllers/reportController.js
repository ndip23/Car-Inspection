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

    // --- THIS IS THE NEW, ROBUST AGGREGATION QUERY ---
    const inspections = await Inspection.aggregate([
        // Stage 1: Filter inspections by the date range.
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        // Stage 2: Join with the 'vehicles' collection.
        { $lookup: { from: "vehicles", localField: "vehicle", foreignField: "_id", as: "vehicleDetails" } },
        // Stage 3: Join with the 'users' collection for the inspector name.
        { $lookup: { from: "users", localField: "inspector", foreignField: "_id", as: "inspectorDetails" } },
        // Stage 4: Deconstruct the arrays from the lookups.
        { $unwind: { path: "$vehicleDetails", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$inspectorDetails", preserveNullAndEmptyArrays: true } },
        // Stage 5: Format the final output to match what the frontend expects.
        {
            $project: {
                _id: 1,
                date: 1,
                result: 1,
                vehicle: {
                    _id: "$vehicleDetails._id",
                    license_plate: "$vehicleDetails.license_plate"
                },
                inspector: {
                    _id: "$inspectorDetails._id",
                    name: { $ifNull: ["$inspectorDetails.name", "Unknown"] } // Fallback if inspector is deleted
                }
            }
        },
        // Stage 6: Sort by date.
        { $sort: { date: -1 } }
    ]);
    // ----------------------------------------------------

    res.json(inspections);
});

export { getInspectionReport };