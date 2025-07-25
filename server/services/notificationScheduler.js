// server/services/notificationScheduler.js
import cron from 'node-cron';
import { startOfDay, addDays } from 'date-fns';
import Inspection from '../models/Inspection.js';
import Notification from '../models/Notification.js';

// This job runs once every day at 1:00 AM.
const scheduleNotificationChecks = () => {
    cron.schedule('0 1 * * *', async () => {
        console.log('Running daily check for upcoming inspections...');
        
        const notificationWindowStart = startOfDay(new Date());
        const notificationWindowEnd = addDays(notificationWindowStart, 7); // 1 week from now

        // Find all inspections due within the next 7 days
        const upcomingInspections = await Inspection.find({
            next_due_date: {
                $gte: notificationWindowStart,
                $lte: notificationWindowEnd,
            }
        }).populate('vehicle');

        for (const inspection of upcomingInspections) {
            // Check if a notification for this specific inspection already exists
            const existingNotification = await Notification.findOne({ inspection: inspection._id });

            if (!existingNotification && inspection.vehicle) {
                console.log(`Creating notification for vehicle ${inspection.vehicle.license_plate}`);
                
                // Create a notification record in the database
                await Notification.create({
                    vehicle: inspection.vehicle._id,
                    inspection: inspection._id,
                    dueDate: inspection.next_due_date,
                    message: `Inspection for ${inspection.vehicle.license_plate} is due on ${new Date(inspection.next_due_date).toLocaleDateString()}.`,
                    status: 'pending', // Will be sent by another process or on demand
                });
            }
        }
    });
};

export default scheduleNotificationChecks;