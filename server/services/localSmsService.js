// server/services/localSmsService.js
import axios from 'axios';
import Setting from '../models/Setting.js';
import { format } from 'date-fns';

const sendSms = async (recipientNumber, message) => {
    const gatewayUrlSetting = await Setting.findOne({ key: 'smsGatewayUrl' });
    if (!gatewayUrlSetting || !gatewayUrlSetting.value) {
        console.log('Local SMS Gateway URL is not configured. Skipping SMS.');
        return false;
    }
    const gatewayUrl = `${gatewayUrlSetting.value}/sendsms`;
    const cleanedNumber = recipientNumber.replace(/[^0-9]/g, '');
    try {
        await axios.post(gatewayUrl, { number: cleanedNumber, message });
        console.log(`✅ SMS command sent to local gateway for number: ${cleanedNumber}`);
        return true;
    } catch (error) {
        console.error(`❌ Error sending command to local gateway:`, error.message);
        return false;
    }
};

export const sendWelcomeSms = (recipientNumber, ownerName) => {
    const message = `Welcome to VisuTech, ${ownerName}! Your vehicle is being inspected and should be ready in approximately 20 minutes.`;
    return sendSms(recipientNumber, message);
};

export const sendFailedInspectionSms = (recipientNumber, ownerName, licensePlate) => {
    const message = `Dear ${ownerName}, the inspection for your vehicle ${licensePlate} has failed. Please see the inspector for details on the necessary repairs.`;
    return sendSms(recipientNumber, message);
};

// --- THIS IS THE DYNAMIC FUNCTION ---
export const sendDueDateReminderSms = async (recipientNumber, ownerName, licensePlate, dueDate) => {
    // We will reuse the 'whatsappReminder' template for SMS for simplicity.
    // You could create a separate 'smsReminderTemplate' setting if you wanted.
    const setting = await Setting.findOne({ key: 'whatsappReminder' });
    const templateFromDB = setting ? setting.value : "Reminder: Inspection for {{2}} is due on {{3}}.";
    
    const formattedDate = format(new Date(dueDate), 'MMMM do, yyyy');

    // Replace placeholders from the template fetched from the database
    const message = templateFromDB
        .replace('{{1}}', ownerName)
        .replace('{{2}}', licensePlate)
        .replace('{{3}}', formattedDate);

    return sendSms(recipientNumber, message);
};
export const sendPassedInspectionSms = (recipientNumber, ownerName, licensePlate, nextDueDate) => {
    const formattedDate = format(new Date(nextDueDate), 'MMMM do, yyyy');
    const message = `Congratulations ${ownerName}! Your vehicle ${licensePlate} passed inspection. Next inspection is due on ${formattedDate}. -VisuTech`;
    return sendSms(recipientNumber, message);
};