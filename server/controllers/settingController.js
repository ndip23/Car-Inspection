// server/controllers/settingController.js
import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';

const getSettings = asyncHandler(async (req, res) => {
    console.log('--- ENTERING getSettings CONTROLLER ---');
    try {
        const requiredKeys = ['licenseStatus', 'trialStartDate', 'smsGatewayUrl'];
        console.log('Required setting keys:', requiredKeys);

        const settingsFromDB = await Setting.find({ key: { $in: requiredKeys } });
        console.log(`Found ${settingsFromDB.length} existing settings in DB.`);

        const existingKeys = settingsFromDB.map(s => s.key);
        const missingKeys = requiredKeys.filter(k => !existingKeys.includes(k));
        console.log('Missing keys:', missingKeys);

        if (missingKeys.length > 0) {
            console.log('Creating default values for missing keys...');
            const newSettings = missingKeys.map(key => {
                let defaultValue;
                if (key === 'licenseStatus') defaultValue = 'trial';
                else if (key === 'trialStartDate') defaultValue = new Date();
                else defaultValue = '';
                return { key, value: defaultValue };
            });
            await Setting.insertMany(newSettings);
            console.log('Successfully inserted new default settings.');
        }

        const allSettings = await Setting.find({});
        const settingsMap = allSettings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});

        console.log('--- EXITING getSettings SUCCESSFULLY ---');
        res.json(settingsMap);

    } catch (error) {
        console.error('!!! CRASH IN getSettings !!!', error);
        res.status(500);
        throw new Error('Server error in getSettings.');
    }
});

const updateSettings = asyncHandler(async (req, res) => {
    const settingsFromFrontend = req.body;

    // --- ADD THE NEW TEMPLATE KEYS TO THIS LIST ---
    const editableKeys = [
        'smsGatewayUrl', 
        'licenseStatus', 
        'trialStartDate',
        'emailReminderSubject', 
        'emailReminderBody',
        'whatsappReminder', 
        'welcomeMessage',
        'passedMessage',
        'failedMessage'
    ];

    try {
        const updatePromises = [];
        for (const key of editableKeys) {
            if (Object.hasOwnProperty.call(settingsFromFrontend, key)) {
                const value = settingsFromFrontend[key];
                const promise = Setting.findOneAndUpdate(
                    { key: key },
                    { $set: { value: value } },
                    { upsert: true, new: true }
                );
                updatePromises.push(promise);
            }
        }
        await Promise.all(updatePromises);
        res.json({ message: 'Settings updated successfully.' });
    } catch (error) {
        res.status(500);
        throw new Error('An error occurred while saving settings.');
    }
});

export { getSettings, updateSettings };