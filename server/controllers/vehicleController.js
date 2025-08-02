// server/controllers/vehicleController.js
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import Inspection from '../models/Inspection.js';
import { sendDueDateReminderEmail } from '../services/emailService.js';
import { sendDueDateReminderWhatsApp } from '../services/whatsappService.js';
import { sendDueDateReminderSms } from '../services/localSmsService.js';
import { format } from 'date-fns';

const createVehicle = asyncHandler(async (req, res) => {
  const { 
    license_plate, category, vehicle_type, 
    customer_name, customer_phone, customer_email, customer_whatsapp
  } = req.body;
  const vehicleExists = await Vehicle.findOne({ license_plate });
  if (vehicleExists) {
    res.status(400);
    throw new Error('Vehicle with this license plate already exists');
  }
  const vehicle = await Vehicle.create({
    license_plate, category, vehicle_type, 
    customer_name, customer_phone, customer_email, customer_whatsapp
  });
  res.status(201).json(vehicle);
});

// --- THIS IS THE FINAL, GUARANTEED-TO-WORK VERSION ---
const getVehicles = asyncHandler(async (req, res) => {
  // Create a filter object that will be used in the find query.
  const filter = {};
  
  // Check if a search query exists AND it's not just an empty string.
  if (req.query.search && req.query.search.trim() !== '') {
    // If it's valid, add the regex condition to the filter object.
    filter.license_plate = { $regex: req.query.search, $options: 'i' };
  }
  
  // Now, the query is either Vehicle.find({}) which gets all vehicles,
  // or Vehicle.find({ license_plate: { ... } }) which filters them. This is foolproof.
  const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
  
  res.status(200).json(vehicles || []);
});
// ---------------------------------------------------
 
const getVehicleById = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400); throw new Error('Invalid vehicle ID format.');
    }
    const vehicle = await Vehicle.findById(req.params.id);
    if (vehicle) {
        res.json(vehicle);
    } else {
        res.status(404); throw new Error('Vehicle not found.');
    }
});

const updateVehicleCustomer = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400); throw new Error('Invalid vehicle ID format.');
    }
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
        res.status(404); throw new Error('Vehicle not found');
    }
    const { customer_name, customer_phone, customer_email, customer_whatsapp } = req.body;
    vehicle.customer_name = customer_name || vehicle.customer_name;
    vehicle.customer_phone = customer_phone || vehicle.customer_phone;
    vehicle.customer_email = customer_email || vehicle.customer_email;
    vehicle.customer_whatsapp = customer_whatsapp;
    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
});

const sendManualReminder = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
        res.status(404); throw new Error('Vehicle not found');
    }
    const latestInspection = await Inspection.findOne({ vehicle: vehicle._id }).sort({ date: -1 });
    if (!latestInspection || !latestInspection.next_due_date) {
        res.status(400); throw new Error('No valid inspection history found to send a reminder.');
    }

    let emailSuccess = false, whatsappSuccess = false, smsSuccess = false;
    const { next_due_date } = latestInspection;

    emailSuccess = await sendDueDateReminderEmail(vehicle.customer_email, vehicle.customer_name, vehicle.license_plate, next_due_date);
    smsSuccess = await sendDueDateReminderSms(vehicle.customer_phone, vehicle.customer_name, vehicle.license_plate, next_due_date);
    if (vehicle.customer_whatsapp) {
        whatsappSuccess = await sendDueDateReminderWhatsApp(vehicle.customer_whatsapp, vehicle.customer_name, vehicle.license_plate, next_due_date);
    }

    if (emailSuccess || whatsappSuccess || smsSuccess) {
        res.json({ message: 'Manual reminder sent successfully.' });
    } else {
        res.status(500); throw new Error('Failed to send reminders on all channels.');
    }
});

export { createVehicle, getVehicles, getVehicleById, updateVehicleCustomer, sendManualReminder };