// server/controllers/vehicleController.js
import asyncHandler from 'express-async-handler';
import Vehicle from '../models/Vehicle.js';
import Inspection from '../models/Inspection.js';
import { sendInspectionReminder as sendEmailReminder } from '../services/emailService.js';
import { sendWhatsAppReminder } from '../services/whatsappService.js';
import { format } from 'date-fns';

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private/Inspector
const createVehicle = asyncHandler(async (req, res) => {
  // --- UPDATED: Destructure the new "customer" fields ---
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
  
  const vehicles = await Vehicle.find({ ...keyword });
  res.json(vehicles);
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

    if (!latestInspection) {
        res.status(404);
        throw new Error('No inspection history found for this vehicle.');
    }

    if (!latestInspection.next_due_date) {
        res.status(400);
        throw new Error('The latest inspection for this vehicle does not have a next due date.');
    }

    let emailSuccess = false;
    let whatsappSuccess = false;
    const { next_due_date } = latestInspection;

    emailSuccess = await sendEmailReminder(
        vehicle.owner_email,
        vehicle.owner_name,
        vehicle.license_plate,
        next_due_date
    );

    if (vehicle.owner_whatsapp) {
        const formattedDate = format(new Date(next_due_date), 'MMMM do, yyyy');
        whatsappSuccess = await sendWhatsAppReminder(
            vehicle.owner_whatsapp,
            vehicle.owner_name,
            vehicle.license_plate,
            formattedDate
        );
    }

    if (emailSuccess || whatsappSuccess) {
        res.json({ message: 'Manual reminder sent successfully.' });
    } else {
        res.status(500);
        throw new Error('Failed to send reminders on all channels.');
    }
});

export { createVehicle, getVehicles, getVehicleById, sendManualReminder };