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
    console.log('--- ENTERING updateSettings CONTROLLER ---');
    try {
        const settingsToUpdate = req.body;
        console.log('Received settings to update:', settingsToUpdate);

        const editableKeys = ['smsGatewayUrl', 'licenseStatus', 'whatsappReminder', 'emailReminderSubject', 'emailReminderBody'];
        
        // Using a simple for...of loop for maximum reliability and clear logging
        for (const key of editableKeys) {
            if (Object.hasOwnProperty.call(settingsToUpdate, key)) {
                const value = settingsToUpdate[key];
                console.log(`Updating setting -> Key: ${key}, Value: ${value}`);
                await Setting.findOneAndUpdate(
                    { key: key },
                    { $set: { value: value } },
                    { upsert: true, new: true }
                );
            }
        }

        console.log('--- EXITING updateSettings SUCCESSFULLY ---');
        res.json({ message: 'Settings updated successfully.' });

    } catch (error) {
        console.error('!!! CRASH IN updateSettings !!!', error);
        res.status(500);
        throw new Error('An error occurred while saving settings.');
    }
});

export { getSettings, updateSettings };