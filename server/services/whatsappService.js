// server/services/whatsappService.js
import axios from 'axios';
import { format } from 'date-fns';

const API_KEY = process.env.DIALOG360_API_KEY;
const API_URL = 'https://waba.360dialog.io/v1/messages';
const NAMESPACE = process.env.DIALOG360_NAMESPACE; // Fetch namespace from .env

const sendWhatsAppTemplate = async (recipientNumber, templateName, parameters) => {
    if (!API_KEY || !NAMESPACE) {
        console.error('360dialog API Key or Namespace is missing from .env. Skipping WhatsApp.');
        return false;
    }
    const cleanedNumber = recipientNumber.replace(/[^0-9]/g, '');
    const data = {
        to: cleanedNumber,
        type: "template",
        template: {
            namespace: NAMESPACE,
            name: templateName.toLowerCase(), // Template names are usually lowercase
            language: { code: "en_US" }, // Use "en_US" for better compatibility
            components: [{ type: "body", parameters }]
        }
    };
    try {
        await axios.post(API_URL, data, {
            headers: { 'D360-API-KEY': API_KEY, 'Content-Type': 'application/json' }
        });
        console.log(`✅ 360dialog WhatsApp (${templateName}) sent successfully to ${cleanedNumber}`);
        return true;
    } catch (error) {
        console.error(`❌ Error sending 360dialog WhatsApp (${templateName}):`, error.response ? error.response.data : error.message);
        return false;
    }
};

export const sendWelcomeWhatsApp = (recipientNumber, ownerName) => {
    const parameters = [{ type: "text", text: ownerName }];
    // Template must be named 'welcome_inspection' in your WhatsApp Business Manager
    return sendWhatsAppTemplate(recipientNumber, "welcome_inspection", parameters);
};

export const sendPassedInspectionWhatsApp = (recipientNumber, ownerName, licensePlate, nextDueDate) => {
    const formattedDate = format(new Date(nextDueDate), 'MMMM do, yyyy');
    const parameters = [
        { type: "text", text: ownerName },
        { type: "text", text: licensePlate },
        { type: "text", text: formattedDate }
    ];
    // Template must be named 'passed_inspection'
    return sendWhatsAppTemplate(recipientNumber, "passed_inspection", parameters);
};

export const sendFailedInspectionWhatsApp = (recipientNumber, ownerName, licensePlate) => {
    const parameters = [
        { type: "text", text: ownerName },
        { type: "text", text: licensePlate }
    ];
    // Template must be named 'failed_inspection'
    return sendWhatsAppTemplate(recipientNumber, "failed_inspection", parameters);
};

export const sendDueDateReminderWhatsApp = (recipientNumber, ownerName, licensePlate, dueDate) => {
    const formattedDate = format(new Date(dueDate), 'MMMM do, yyyy');
    const parameters = [
        { type: "text", text: ownerName },
        { type: "text", text: licensePlate },
        { type: "text", text: formattedDate }
    ];
    // Template must be named 'inspection_reminder'
    return sendWhatsAppTemplate(recipientNumber, "inspection_reminder", parameters);
};