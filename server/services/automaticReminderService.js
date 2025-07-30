// server/services/automaticReminderService.js
import cron from 'node-cron';
import Inspection from '../models/Inspection.js';
import { startOfDay, addDays } from 'date-fns';
import { sendDueDateReminderEmail } from './emailService.js';
import { sendDueDateReminderWhatsApp } from './whatsappService.js'; // For 360dialog
import { sendDueDateReminderSms } from './localSmsService.js';     // For ngrok/Android

const REMINDER_WINDOW_DAYS = 7;

const startAutomaticReminders = () => {
    // This is the scheduler. '0 9 * * *' means "run at 9:00 AM every day".
    console.log('✅ Automatic multi-channel reminder service is scheduled to run daily at 9:00 AM.');
    
    cron.schedule('0 9 * * *', async () => {
        console.log('--- [CRON JOB RUNNING] --- Checking for due inspections...');
        
        const now = startOfDay(new Date());
        const windowEnd = addDays(now, REMINDER_WINDOW_DAYS);

        try {
            // Find all inspections with a next_due_date within the next 7 days.
            // This logic correctly sends reminders every day for the entire week.
            const inspectionsToSend = await Inspection.find({
                next_due_date: { $gte: now, $lte: windowEnd }
            }).populate('vehicle');

            if (inspectionsToSend.length === 0) {
                console.log('[CRON JOB] No inspections are due within the reminder window today.');
                return;
            }

            console.log(`[CRON JOB] Found ${inspectionsToSend.length} inspections due soon. Processing daily reminders...`);

            // Loop through every single due inspection and send reminders.
            for (const inspection of inspectionsToSend) {
                const { vehicle } = inspection;
                if (!vehicle) continue; // Skip if vehicle was deleted

                console.log(`[CRON JOB] Processing reminder for ${vehicle.license_plate}...`);

                // --- Send on ALL THREE channels every day ---
                await sendDueDateReminderEmail(vehicle.owner_email, vehicle.owner_name, vehicle.license_plate, inspection.next_due_date);
                
                await sendDueDateReminderSms(vehicle.owner_phone, vehicle.owner_name, vehicle.license_plate, inspection.next_due_date);
                
                if (vehicle.owner_whatsapp) {
                    await sendDueDateReminderWhatsApp(vehicle.owner_whatsapp, vehicle.owner_name, vehicle.license_plate, inspection.next_due_date);
                }
            }
             console.log(`--- [CRON JOB FINISHED] --- Processed all reminders.`);

        } catch (error) {
            console.error('[CRON JOB ERROR] An error occurred during the automatic reminder process:', error);
        }
    }, {
        scheduled: true,
        timezone: "Africa/Douala" // IMPORTANT: Set to the client's timezone
    });
};

export default startAutomaticReminders;