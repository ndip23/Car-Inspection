// server/controllers/settingController.js
import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';

// @desc    Get all settings and create defaults if they don't exist
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
    // --- THIS IS THE NEW, ROBUST LOGIC ---
    // Define the keys for the settings we absolutely need.
    const requiredKeys = ['licenseStatus', 'trialStartDate', 'smsGatewayUrl'];
    
    // Fetch all existing settings.
    const settingsFromDB = await Setting.find({});
    
    // Check which keys are missing from the database.
    const existingKeys = settingsFromDB.map(s => s.key);
    const missingKeys = requiredKeys.filter(k => !existingKeys.includes(k));

    // If any keys are missing, create them now.
    if (missingKeys.length > 0) {
        const newSettings = missingKeys.map(key => {
            let defaultValue;
            switch (key) {
                case 'licenseStatus':
                    defaultValue = 'trial';
                    break;
                case 'trialStartDate':
                    defaultValue = new Date(); // Set the trial start to now
                    break;
                default:
                    defaultValue = ''; // Default for smsGatewayUrl etc.
            }
            return { key, value: defaultValue };
        });
        
        // Insert the new default settings into the database.
        await Setting.insertMany(newSettings);
    }

    // Refetch all settings to ensure we have a complete and consistent set.
    const allSettings = await Setting.find({});
    const settingsMap = allSettings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});

    res.json(settingsMap);
});

// @desc    Update or create multiple settings at once
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
    const settingsToUpdate = req.body;
    
    const operations = Object.keys(settingsToUpdate).map(key => ({
        updateOne: {
            filter: { key: key },
            update: { $set: { value: settingsToUpdate[key] } },
            upsert: true,
        }
    }));

    if (operations.length > 0) {
        await Setting.bulkWrite(operations);
    }
    
    res.json({ message: 'Settings updated successfully.' });
});

export { getSettings, updateSettings };