import axios from 'axios';
import Setting from '../models/Setting.js'; // Import the Setting model

export const sendLocalSmsReminder = async (recipientNumber, message) => {
    // 1. Fetch the gateway URL from the database.
    const gatewayUrlSetting = await Setting.findOne({ key: 'smsGatewayUrl' });

    // 2. Check if the URL has been configured in the Developer Panel.
    if (!gatewayUrlSetting || !gatewayUrlSetting.value || gatewayUrlSetting.value.trim() === '') {
        console.log('Local SMS Gateway URL is not configured. Skipping SMS.');
        return false; // Indicate failure
    }
    
    // 3. Prepare to send the message.
    const gatewayUrl = `${gatewayUrlSetting.value}/sendsms`;
    const cleanedNumber = recipientNumber.replace(/[^0-9]/g, '');
    const payload = {
        number: cleanedNumber,
        message: message,
    };

    // 4. Send the command to the client's configured gateway.
    try {
        await axios.post(gatewayUrl, payload);
        console.log(`✅ SMS command sent to client gateway for number: ${cleanedNumber}`);
        return true;
    } catch (error) {
        console.error(`❌ Error sending command to client gateway:`, error.message);
        return false;
    }
};