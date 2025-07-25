// server/services/whatsappService.js
import axios from 'axios';

const API_KEY = process.env.DIALOG360_API_KEY;
const API_URL = 'https://waba.360dialog.io/v1/messages';

export const sendWhatsAppReminder = async (recipientNumber, ownerName, vehiclePlate, dueDate) => {
    // 1. Clean the phone number: remove spaces, plus signs, etc., and ensure it starts with country code.
    // This example assumes Cameroon's country code (237) is included.
    const cleanedNumber = recipientNumber.replace(/[^0-9]/g, '');

    // 2. Define the payload using the approved template
    const data = {
        to: cleanedNumber,
        type: "template",
        template: {
            namespace: "your_template_namespace", // Find this in your 360dialog dashboard
            name: "inspection_reminder", // The name you gave your template
            language: {
                code: "en" // or the language code you used
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: ownerName },       // {{1}}
                        { type: "text", text: vehiclePlate },    // {{2}}
                        { type: "text", text: dueDate }          // {{3}}
                    ]
                }
            ]
        }
    };

    // 3. Send the request
    try {
        await axios.post(API_URL, data, {
            headers: {
                'D360-API-KEY': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        console.log(`WhatsApp reminder sent successfully to ${cleanedNumber}`);
        return true;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.response ? error.response.data : error.message);
        return false;
    }
};