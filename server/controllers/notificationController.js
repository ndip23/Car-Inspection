import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';
import { sendInspectionReminder as sendEmailReminder } from '../services/emailService.js';
import { sendWhatsAppReminder } from '../services/whatsappService.js'; 
import { format } from 'date-fns';

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ status: { $in: ['pending', 'sent'] } })
        .populate('vehicle', 'license_plate owner_name owner_email')
        .sort({ createdAt: -1 });
    res.json(notifications);
});


const sendNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id).populate('vehicle');
    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    const { vehicle } = notification;
    let emailSuccess = false;
    let whatsappSuccess = false;

    // --- 1. Attempt to send Email ---
    emailSuccess = await sendEmailReminder(
        vehicle.owner_email,
        vehicle.owner_name,
        vehicle.license_plate,
        notification.dueDate
    );

    // --- 2. Attempt to send WhatsApp if number exists ---
    if (vehicle.owner_whatsapp && vehicle.owner_whatsapp.trim() !== '') {
        const formattedDate = format(new Date(notification.dueDate), 'MMMM do, yyyy');
        whatsappSuccess = await sendWhatsAppReminder(
            vehicle.owner_whatsapp,
            vehicle.owner_name,
            vehicle.license_plate,
            formattedDate
        );
    }

    // --- 3. Update status and respond ---
    if (emailSuccess || whatsappSuccess) {
        notification.status = 'sent';
        notification.sentAt = new Date();
        await notification.save();
        res.json({ 
            message: 'Reminders sent.',
            emailSent: emailSuccess,
            whatsappSent: whatsappSuccess
        });
    } else {
        res.status(500);
        throw new Error('Failed to send reminders on all channels.');
    }
});

const acknowledgeNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
        notification.status = 'acknowledged';
        await notification.save();
        res.json({ message: 'Notification acknowledged' });
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

export { getNotifications, sendNotification, acknowledgeNotification };