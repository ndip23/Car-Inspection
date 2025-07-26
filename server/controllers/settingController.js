import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
    const settings = await Setting.find({});
    // Convert array to a key-value object for easier use on frontend
    const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});
     if (!settingsMap.licenseStatus) {
        settingsMap.licenseStatus = 'trial'; // Default to trial if not set
    }
    res.json(settingsMap);
});

// @desc    Update or create a setting
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
    const settingsToUpdate = req.body; // Expects an object like { key1: value1, key2: value2 }
    
    const operations = Object.keys(settingsToUpdate).map(key => ({
        updateOne: {
            filter: { key: key },
            update: { $set: { value: settingsToUpdate[key] } },
            upsert: true, // Creates the setting if it doesn't exist
        }
    }));

    await Setting.bulkWrite(operations);
    res.json({ message: 'Settings updated successfully.' });
});

export { getSettings, updateSettings };