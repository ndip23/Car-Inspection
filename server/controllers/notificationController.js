// server/controllers/notificationController.js
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Inspection from '../models/Inspection.js';
import { startOfDay, addDays, format } from 'date-fns';
import { sendDueDateReminderEmail } from '../services/emailService.js';
import { sendDueDateReminderWhatsApp } from '../services/whatsappService.js';
import { sendDueDateReminderSms } from '../services/localSmsService.js';

const REMINDER_WINDOW_DAYS = 7;

// This function is correct.
const getNotifications = asyncHandler(async (req, res) => {
    const now = startOfDay(new Date());
    const windowEnd = addDays(now, REMINDER_WINDOW_DAYS);
    const latestInspections = await Inspection.aggregate([
        { $sort: { vehicle: 1, date: -1 } },
        { $group: { _id: "$vehicle", latestInspectionId: { $first: "$_id" } } },
        { $lookup: { from: "inspections", localField: "latestInspectionId", foreignField: "_id", as: "inspectionDetails" } },
        { $unwind: "$inspectionDetails" },
        { $lookup: { from: "vehicles", localField: "inspectionDetails.vehicle", foreignField: "_id", as: "vehicleDetails" } },
        { $unwind: "$vehicleDetails" },
        { $match: { "inspectionDetails.next_due_date": { $gte: now, $lte: windowEnd } } },
        { $project: { _id: "$inspectionDetails._id", vehicle: "$vehicleDetails", dueDate: "$inspectionDetails.next_due_date", status: 'pending', message: { $concat: [ "Inspection for ", "$vehicleDetails.license_plate", " is due on ", { $dateToString: { format: "%Y-%m-%d", date: "$inspectionDetails.next_due_date" } } ] } } }
    ]);
    res.json(latestInspections);
});

// This function is correct.
const sendNotification = asyncHandler(async (req, res) => {
    const inspection = await Inspection.findById(req.params.id).populate('vehicle');
    if (!inspection || !inspection.vehicle) {
        res.status(404); throw new Error('Inspection or associated vehicle not found.');
    }
    const { vehicle } = inspection;
    let emailSuccess = false, smsSuccess = false, whatsappSuccess = false;
    emailSuccess = await sendDueDateReminderEmail(vehicle.customer_email, vehicle.customer_name, vehicle.license_plate, inspection.next_due_date);
    smsSuccess = await sendDueDateReminderSms(vehicle.customer_phone, vehicle.customer_name, vehicle.license_plate, inspection.next_due_date);
    if (vehicle.customer_whatsapp) {
        whatsappSuccess = await sendDueDateReminderWhatsApp(vehicle.customer_whatsapp, vehicle.customer_name, vehicle.customer_plate, inspection.next_due_date);
    }
    if (emailSuccess || smsSuccess || whatsappSuccess) {
        res.json({ message: 'Reminder sent successfully.' });
    } else {
        res.status(500); throw new Error('Failed to send reminders on all channels.');
    }
});

// --- THIS IS THE FINAL, CORRECTED FUNCTION ---
const sendAllPendingReminders = asyncHandler(async (req, res) => {
    const now = startOfDay(new Date());
    const windowEnd = addDays(now, REMINDER_WINDOW_DAYS);

    // The aggregation pipeline was missing from here. It is now restored.
    const pendingReminders = await Inspection.aggregate([
        { $sort: { vehicle: 1, date: -1 } },
        { $group: { _id: "$vehicle", latestInspectionId: { $first: "$_id" } } },
        { $lookup: { from: "inspections", localField: "latestInspectionId", foreignField: "_id", as: "inspectionDetails" } },
        { $unwind: "$inspectionDetails" },
        { $lookup: { from: "vehicles", localField: "inspectionDetails.vehicle", foreignField: "_id", as: "vehicleDetails" } },
        { $unwind: "$vehicleDetails" },
        { $match: { "inspectionDetails.next_due_date": { $gte: now, $lte: windowEnd } } },
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

    for (const reminder of pendingReminders) {
        const { vehicle, dueDate } = reminder;
        let emailSuccess = false, smsSuccess = false, whatsappSuccess = false;

        emailSuccess = await sendDueDateReminderEmail(vehicle.customer_email, vehicle.customer_name, vehicle.license_plate, dueDate);
        smsSuccess = await sendDueDateReminderSms(vehicle.customer_phone, vehicle.customer_name, vehicle.license_plate, dueDate);
        if (vehicle.customer_whatsapp) {
            whatsappSuccess = await sendDueDateReminderWhatsApp(vehicle.customer_whatsapp, vehicle.customer_name, vehicle.license_plate, dueDate);
        }

        if (emailSuccess || smsSuccess || whatsappSuccess) {
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
// ---------------------------------------------------

const acknowledgeNotification = asyncHandler(async (req, res) => {
    res.json({ message: 'This action is no longer required.' });
});

export { getNotifications, sendNotification, acknowledgeNotification, sendAllPendingReminders };