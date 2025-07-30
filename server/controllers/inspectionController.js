import asyncHandler from 'express-async-handler';
import Inspection from '../models/Inspection.js';
import Vehicle from '../models/Vehicle.js';

// Import ALL the necessary messaging functions
import { 
    sendWelcomeEmail, 
    sendFailedInspectionEmail,
    sendPassedInspectionEmail 
} from '../services/emailService.js';
import { 
    sendWelcomeWhatsApp, 
    sendFailedInspectionWhatsApp,
    sendPassedInspectionWhatsApp
} from '../services/whatsappService.js';
import { 
    sendWelcomeSms, 
    sendFailedInspectionSms,
    sendPassedInspectionSms
} from '../services/localSmsService.js';

// This is the only controller needed for inspections now
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

    // --- FULLY AUTOMATIC IMMEDIATE MESSAGING ---
    // These run in the background ("fire and forget") so the inspector gets a fast response.

    // 1. Always send the "Welcome / In Progress" message.
    console.log(`[ACTION] Sending Welcome messages for ${vehicle.license_plate}`);
    sendWelcomeEmail(vehicle.owner_email, vehicle.owner_name);
    sendWelcomeSms(vehicle.owner_phone, vehicle.owner_name);
    if (vehicle.owner_whatsapp) {
        sendWelcomeWhatsApp(vehicle.owner_whatsapp, vehicle.owner_name);
    }

    // 2. Send the appropriate "Result" message based on the outcome.
    if (createdInspection.result === 'pass') {
        console.log(`[ACTION] Sending PASSED messages for ${vehicle.license_plate}`);
        sendPassedInspectionEmail(vehicle.owner_email, vehicle.owner_name, vehicle.license_plate, createdInspection.next_due_date);
        sendPassedInspectionSms(vehicle.owner_phone, vehicle.owner_name, vehicle.license_plate, createdInspection.next_due_date);
        if (vehicle.owner_whatsapp) {
            sendPassedInspectionWhatsApp(vehicle.owner_whatsapp, vehicle.owner_name, vehicle.license_plate, createdInspection.next_due_date);
        }
    } else { // if result is 'fail'
        console.log(`[ACTION] Sending FAILED messages for ${vehicle.license_plate}`);
        sendFailedInspectionEmail(vehicle.owner_email, vehicle.owner_name, vehicle.license_plate);
        sendFailedInspectionSms(vehicle.owner_phone, vehicle.owner_name, vehicle.license_plate);
        if (vehicle.owner_whatsapp) {
            sendFailedInspectionWhatsApp(vehicle.owner_whatsapp, vehicle.owner_name, vehicle.license_plate);
        }
        
        // We can still use this flag to ensure we don't accidentally re-send a fail notice if the record is ever edited.
        createdInspection.failNotificationSent = true;
        await createdInspection.save();
    }
    // --------------------------------------------------

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