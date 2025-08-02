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

// Helper to fetch a specific template with a safe fallback
const getTemplate = async (key, fallback) => {
    const setting = await Setting.findOne({ key: key });
    return setting ? setting.value : fallback;
};

export const sendWelcomeSms = async (recipientNumber, ownerName) => {
    const template = await getTemplate('welcomeMessage', "Welcome to Harmony Inpection, {{customerName}}! Your vehicle is being inspected.");
    const message = template.replace(new RegExp('{{customerName}}', 'g'), ownerName);
    return sendSms(recipientNumber, message);
};

export const sendPassedInspectionSms = async (recipientNumber, ownerName, licensePlate, nextDueDate) => {
    const template = await getTemplate('passedMessage', "Congratulations, {{customerName}}! Your vehicle {{licensePlate}} passed. Next inspection is due on {{nextDueDate}}.");
    const formattedDate = format(new Date(nextDueDate), 'MMMM do, yyyy');
    const message = template
        .replace(new RegExp('{{customerName}}', 'g'), ownerName)
        .replace(new RegExp('{{licensePlate}}', 'g'), licensePlate)
        .replace(new RegExp('{{nextDueDate}}', 'g'), formattedDate);
    return sendSms(recipientNumber, message);
};

export const sendFailedInspectionSms = async (recipientNumber, ownerName, licensePlate) => {
    const template = await getTemplate('failedMessage', "Dear {{customerName}}, the inspection for your vehicle {{licensePlate}} has failed.");
    const message = template
        .replace(new RegExp('{{customerName}}', 'g'), ownerName)
        .replace(new RegExp('{{licensePlate}}', 'g'), licensePlate);
    return sendSms(recipientNumber, message);
};

export const sendDueDateReminderSms = async (recipientNumber, ownerName, licensePlate, dueDate) => {
    const template = await getTemplate('whatsappReminder', "Reminder: Your vehicle {{2}} is due on {{3}}.");
    const formattedDate = format(new Date(dueDate), 'MMMM do, yyyy');
    const message = template
        .replace('{{1}}', ownerName)
        .replace('{{2}}', licensePlate)
        .replace('{{3}}', formattedDate);
    return sendSms(recipientNumber, message);
};