// server/controllers/settingController.js
import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';

// @desc    Get all settings and create defaults if they don't exist
// @route   GET /api/settings
// @access  Private/Admin or Developer
const getSettings = asyncHandler(async (req, res) => {
    const requiredKeys = ['licenseStatus', 'trialStartDate', 'smsGatewayUrl'];
    const settingsFromDB = await Setting.find({ key: { $in: requiredKeys } });
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

// @desc    Update one or more settings
// @route   PUT /api/settings
// @access  Private/Admin or Developer
const updateSettings = asyncHandler(async (req, res) => {
    const settingsToUpdate = req.body;

    try {
        const updatePromises = Object.entries(settingsToUpdate).map(([key, value]) =>
            Setting.findOneAndUpdate(
                { key: key },
                { $set: { value: value } },
                { upsert: true, new: true }
            )
        );
        await Promise.all(updatePromises);
        res.json({ message: 'Settings updated successfully.' });
    } catch (error) {
        res.status(500);
        throw new Error('An error occurred while saving settings.');
    }
});

export { getSettings, updateSettings };