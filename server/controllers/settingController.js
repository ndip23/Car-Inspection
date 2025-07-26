// server/controllers/settingController.js
import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';

// @desc    Get all settings as a key-value object
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
    const settingsFromDB = await Setting.find({});
    
    let settingsMap = settingsFromDB.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});

    // --- THIS IS THE FIX ---
    // Define our safe defaults.
    const defaultSettings = {
        licenseStatus: 'trial',
        trialStartDate: new Date().toISOString(), // Use current date if none exists
        smsGatewayUrl: '',
        // You can add other template defaults here too if needed
    };

    // Merge the settings from the DB with the defaults.
    // This GUARANTEES that the frontend will always receive a value for these critical keys.
    const finalSettings = { ...defaultSettings, ...settingsMap };
    // ---------------------------------

    res.json(finalSettings);
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