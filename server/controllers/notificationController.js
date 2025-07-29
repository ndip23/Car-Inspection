// server/controllers/notificationController.js
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose'; // Import mongoose for ObjectId
import Inspection from '../models/Inspection.js'; // We now work directly with Inspections
import { startOfDay, addDays } from 'date-fns';
import { sendInspectionReminder as sendEmailReminder } from '../services/emailService.js';
import { sendLocalSmsReminder } from '../services/localSmsService.js'; // Use your local SMS service
import { format } from 'date-fns';

const REMINDER_WINDOW_DAYS = 7;

// --- THIS IS THE NEW, DYNAMIC LOGIC ---
// @desc    Dynamically get all vehicles needing a reminder
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    // 1. Define the time window: from the start of today until 7 days from now.
    const now = startOfDay(new Date());
    const windowEnd = addDays(now, REMINDER_WINDOW_DAYS);

    // 2. Find the MOST RECENT inspection for EVERY vehicle in the database.
    const latestInspections = await Inspection.aggregate([
        // First, sort all inspections by vehicle and then by date descending
        { $sort: { vehicle: 1, date: -1 } },
        // Group by vehicle to get only the very first (most recent) one for each
        {
            $group: {
                _id: "$vehicle",
                latestInspectionId: { $first: "$_id" }
            }
        },
        // Join back to the inspections collection to get full details of that latest inspection
        {
            $lookup: {
                from: "inspections",
                localField: "latestInspectionId",
                foreignField: "_id",
                as: "inspectionDetails"
            }
        },
        { $unwind: "$inspectionDetails" },
        // Join with the vehicles collection to get vehicle details
        {
            $lookup: {
                from: "vehicles",
                localField: "inspectionDetails.vehicle",
                foreignField: "_id",
                as: "vehicleDetails"
            }
        },
        { $unwind: "$vehicleDetails" },
        // 3. Filter these latest inspections to only include those due within our 7-day window.
        {
            $match: {
                "inspectionDetails.next_due_date": {
                    $gte: now,
                    $lte: windowEnd
                }
            }
        },
        // 4. Format the data into a clean "notification" object that the frontend can easily use.
        {
            $project: {
                _id: "$inspectionDetails._id", // Use the Inspection's ID as the unique key
                vehicle: "$vehicleDetails",
                dueDate: "$inspectionDetails.next_due_date",
                status: 'pending', // The status is always 'pending' because this list is generated in real-time
                message: { 
                    $concat: [ 
                        "Inspection for ", 
                        "$vehicleDetails.license_plate", 
                        " is due on ", 
                        { $dateToString: { format: "%Y-%m-%d", date: "$inspectionDetails.next_due_date" } }
                    ]
                }
            }
        }
    ]);
    
    // This now returns a perfectly accurate, real-time list of what needs a reminder.
    res.json(latestInspections);
});


// --- THIS FUNCTION IS UPDATED TO WORK WITH THE NEW SYSTEM ---
// @desc    Send a reminder for a specific upcoming inspection
// @route   POST /api/notifications/:inspectionId/send
// @access  Private
const sendNotification = asyncHandler(async (req, res) => {
    // Note: req.params.id is now an INSPECTION ID, not a Notification ID.
    const inspection = await Inspection.findById(req.params.id).populate('vehicle');

    if (!inspection || !inspection.vehicle) {
        res.status(404);
        throw new Error('Inspection or associated vehicle not found.');
    }
    
    const { vehicle } = inspection;
    let emailSuccess = false;
    let smsSuccess = false;

    // Email
    emailSuccess = await sendEmailReminder(vehicle.owner_email, vehicle.owner_name, vehicle.license_plate, inspection.next_due_date);

    // SMS
    const formattedDate = format(new Date(inspection.next_due_date), 'MMMM do, yyyy');
    const smsMessage = `Dear ${vehicle.owner_name}, your vehicle ${vehicle.license_plate} is due for inspection on ${formattedDate}. -VisuTech`;
    smsSuccess = await sendLocalSmsReminder(vehicle.owner_phone, smsMessage);

    if (emailSuccess || smsSuccess) {
        res.json({ message: 'Reminder sent successfully.' });
    } else {
        res.status(500);
        throw new Error('Failed to send reminders on all channels.');
    }
});

// --- THIS FUNCTION IS NO LONGER NEEDED ---
// The concept of "acknowledging" a notification doesn't exist in this dynamic system.
// The list is recalculated every time.
const acknowledgeNotification = asyncHandler(async (req, res) => {
    res.json({ message: 'This action is no longer required.' });
});

// @desc    Process and send all dynamically generated pending reminders
// @route   POST /api/notifications/send-all
// @access  Private
const sendAllPendingReminders = asyncHandler(async (req, res) => {
    // 1. Get the real-time list of pending reminders using the same logic as getNotifications.
    const now = startOfDay(new Date());
    const windowEnd = addDays(now, 7);
    const pendingReminders = await Inspection.aggregate([
        // This aggregation pipeline is the same as in getNotifications...
        { $sort: { vehicle: 1, date: -1 } },
        { $group: { _id: "$vehicle", latestInspectionId: { $first: "$_id" } } },
        { $lookup: { from: "inspections", localField: "latestInspectionId", foreignField: "_id", as: "inspectionDetails" } },
        { $unwind: "$inspectionDetails" },
        { $lookup: { from: "vehicles", localField: "inspectionDetails.vehicle", foreignField: "_id", as: "vehicleDetails" } },
        { $unwind: "$vehicleDetails" },
        { $match: { "inspectionDetails.next_due_date": { $gte: now, $lte: windowEnd } } },
        // We only need the necessary details for sending.
        { $project: { 
            vehicle: "$vehicleDetails", 
            dueDate: "$inspectionDetails.next_due_date"
        }}
    ]);

    if (pendingReminders.length === 0) {
        return res.json({ message: 'No pending reminders to send.' });
    }

    let successCount = 0;
    let failureCount = 0;

    // 2. Loop through the dynamically generated list and send.
    for (const reminder of pendingReminders) {
        const { vehicle, dueDate } = reminder;
        let emailSuccess = false;
        let smsSuccess = false;

        emailSuccess = await sendEmailReminder(vehicle.owner_email, vehicle.owner_name, vehicle.license_plate, dueDate);
        
        const formattedDate = format(new Date(dueDate), 'MMMM do, yyyy');
        const smsMessage = `Dear ${vehicle.owner_name}, your vehicle ${vehicle.license_plate} is due for inspection on ${formattedDate}. -VisuTech`;
        smsSuccess = await sendLocalSmsReminder(vehicle.owner_phone, smsMessage);

        if (emailSuccess || smsSuccess) {
            successCount++;
        } else {
            failureCount++;
        }
    }

    res.json({
        message: 'Processing complete.',
        successCount,
        failureCount,
        total: pendingReminders.length
    });
});

export { getNotifications, sendNotification, acknowledgeNotification, sendAllPendingReminders };