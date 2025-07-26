// server/controllers/settingController.js
import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';

// This function is already correct and robust. No changes needed here.
const getSettings = asyncHandler(async (req, res) => {
    const requiredKeys = ['licenseStatus', 'trialStartDate', 'smsGatewayUrl'];
    const settingsFromDB = await Setting.find({});
    const existingKeys = settingsFromDB.map(s => s.key);
    const missingKeys = requiredKeys.filter(k => !existingKeys.includes(k));

    if (missingKeys.length > 0) {
        const newSettings = missingKeys.map(key => {
            let defaultValue;
            switch (key) {
                case 'licenseStatus': defaultValue = 'trial'; break;
                case 'trialStartDate': defaultValue = new Date(); break;
                default: defaultValue = '';
            }
            return { key, value: defaultValue };
        });
        await Setting.insertMany(newSettings);
    }

    const allSettings = await Setting.find({});
    const settingsMap = allSettings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});

    res.json(settingsMap);
});


// --- THIS IS THE FINAL, CORRECTED UPDATE FUNCTION ---
// @desc    Update or create multiple settings at once
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
    const settingsFromFrontend = req.body;

    // Define a list of keys that are explicitly allowed to be edited from the frontend.
    const editableKeys = [
        'smsGatewayUrl', 
        'licenseStatus', 
        'whatsappReminder', 
        'emailReminderSubject', 
        'emailReminderBody'
    ];

    try {
        // Create a promise array to run all database updates in parallel.
        const updatePromises = [];

        // Loop through the allowed keys only.
        for (const key of editableKeys) {
            // Check if the frontend sent a value for this specific key.
            if (Object.hasOwnProperty.call(settingsFromFrontend, key)) {
                const value = settingsFromFrontend[key];
                
                // Use findOneAndUpdate with upsert:true. This is the safest way.
                const promise = Setting.findOneAndUpdate(
                    { key: key },
                    { $set: { value: value } },
                    { upsert: true, new: true }
                );
                updatePromises.push(promise);
            }
        }

        // Wait for all the update operations to complete.
        await Promise.all(updatePromises);
        
        res.json({ message: 'Settings updated successfully.' });
    } catch (error) {
        // Catch any potential database errors.
        res.status(500);
        throw new Error('An error occurred while saving settings.');
    }
});
// --------------------------------------------------------------------

export { getSettings, updateSettings };