// server/controllers/vehicleController.js
import asyncHandler from 'express-async-handler';
import Vehicle from '../models/Vehicle.js';
import Inspection from '../models/Inspection.js';
// --- CORRECTED IMPORTS ---
import { sendDueDateReminderEmail } from '../services/emailService.js';
import { sendDueDateReminderWhatsApp } from '../services/whatsappService.js';
import { sendDueDateReminderSms } from '../services/localSmsService.js';
import { format } from 'date-fns';

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private/Inspector
const createVehicle = asyncHandler(async (req, res) => {
  const { 
    license_plate, 
    category, 
    vehicle_type, 
    customer_name, 
    customer_phone, 
    customer_email,
    customer_whatsapp
  } = req.body;

  const vehicleExists = await Vehicle.findOne({ license_plate });
  if (vehicleExists) {
    res.status(400);
    throw new Error('Vehicle with this license plate already exists');
  }

  const vehicle = await Vehicle.create({
    license_plate, 
    category, 
    vehicle_type, 
    customer_name, 
    customer_phone, 
    customer_email,
    customer_whatsapp
  });

  res.status(201).json(vehicle);
});

// @desc    Get all vehicles, with search
// @route   GET /api/vehicles
// @access  Private/Inspector
const getVehicles = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? { license_plate: { $regex: req.query.search, $options: 'i' } }
    : {};
  
  // This query is fine, but we will ensure it always returns an array.
  const vehicles = await Vehicle.find({ ...keyword }).sort({ createdAt: -1 });
  
  res.json(vehicles || []); // This ensures you always get an array
});
 
// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private/Inspector
const getVehicleById = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if(vehicle) {
        res.json(vehicle);
    } else {
        res.status(404);
        throw new Error('Vehicle not found');
    }
});

// @desc    Manually send an inspection reminder for a vehicle
// @route   POST /api/vehicles/:id/remind
// @access  Private
const sendManualReminder = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
        res.status(404);
        throw new Error('Vehicle not found');
    }
    const latestInspection = await Inspection.findOne({ vehicle: vehicle._id }).sort({ date: -1 });
    if (!latestInspection || !latestInspection.next_due_date) {
        res.status(400);
        throw new Error('No valid inspection history found to send a reminder.');
    }

    let emailSuccess = false;
    let whatsappSuccess = false;
    let smsSuccess = false;
    const { next_due_date } = latestInspection;

    // --- CORRECTED SERVICE CALLS with CUSTOMER fields ---
    emailSuccess = await sendDueDateReminderEmail(
        vehicle.customer_email,
        vehicle.customer_name,
        vehicle.license_plate,
        next_due_date
    );

    smsSuccess = await sendDueDateReminderSms(
        vehicle.customer_phone,
        vehicle.customer_name,
        vehicle.license_plate,
        next_due_date
    );

    if (vehicle.customer_whatsapp) {
        whatsappSuccess = await sendDueDateReminderWhatsApp(
            vehicle.customer_whatsapp,
            vehicle.customer_name,
            vehicle.license_plate,
            next_due_date
        );
    }

    if (emailSuccess || whatsappSuccess || smsSuccess) {
        res.json({ message: 'Manual reminder sent successfully.' });
    } else {
        res.status(500);
        throw new Error('Failed to send reminders on all channels.');
    }
});

export { createVehicle, getVehicles, getVehicleById, sendManualReminder };