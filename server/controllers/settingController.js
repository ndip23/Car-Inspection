// server/controllers/settingController.js
import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';

// ... (getSettings function remains the same)
const getSettings = asyncHandler(async (req, res) => {
    const settingsFromDB = await Setting.find({});
    let settingsMap = settingsFromDB.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});
    const defaultSettings = {
        licenseStatus: 'trial',
        trialStartDate: new Date().toISOString(),
        smsGatewayUrl: '',
    };
    const finalSettings = { ...defaultSettings, ...settingsMap };
    res.json(finalSettings);
});


// --- THIS IS THE CORRECTED FUNCTION ---
const updateSettings = asyncHandler(async (req, res) => {
    const settingsToUpdate = req.body;
    
    // Create an array of operations for MongoDB's bulkWrite.
    // This is highly efficient as it performs all updates in a single database call.
    const operations = Object.keys(settingsToUpdate).map(key => {
        // We only want to update keys that are recognized and intended for settings.
        // This prevents accidental data from being saved.
        const validKeys = ['smsGatewayUrl', 'licenseStatus', 'whatsappReminder', 'emailReminderSubject', 'emailReminderBody'];
        if (validKeys.includes(key)) {
            return {
                updateOne: {
                    filter: { key: key }, // Find the setting by its unique key
                    update: { $set: { value: settingsToUpdate[key] } }, // Set its new value
                    upsert: true, // IMPORTANT: This creates the setting if it doesn't exist yet
                }
            };
        }
        return null; // Ignore any unexpected keys
    }).filter(op => op !== null); // Filter out any null operations

    if (operations.length > 0) {
        await Setting.bulkWrite(operations);
    }
    
    res.json({ message: 'Settings updated successfully.' });
});

export { getSettings, updateSettings };