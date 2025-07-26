// server/middleware/licenseMiddleware.js
import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';
import { differenceInDays } from 'date-fns';

const TRIAL_PERIOD_DAYS = 14;

const checkLicense = asyncHandler(async (req, res, next) => {
    // Certain routes should always be accessible, like login or the settings check itself.
    if (req.originalUrl.startsWith('/api/auth/login') || req.originalUrl.startsWith('/api/settings')) {
        return next();
    }
    
    // Find the license status and trial start date settings.
    const licenseStatusSetting = await Setting.findOne({ key: 'licenseStatus' });
    const trialStartDateSetting = await Setting.findOne({ key: 'trialStartDate' });

    let licenseStatus = licenseStatusSetting?.value || 'trial';
    let trialStartDate = trialStartDateSetting?.value;

    // If this is the first time the system is run, create the trial settings.
    if (!trialStartDate) {
        trialStartDate = new Date();
        // Use upsert to create these settings if they don't exist
        await Setting.updateOne({ key: 'trialStartDate' }, { $set: { value: trialStartDate } }, { upsert: true });
        await Setting.updateOne({ key: 'licenseStatus' }, { $set: { value: 'trial' } }, { upsert: true });
    }

    // Now, check the status.
    if (licenseStatus === 'active') {
        // If the license is active, allow the request.
        return next();
    }

    if (licenseStatus === 'trial') {
        const daysSinceStart = differenceInDays(new Date(), new Date(trialStartDate));
        if (daysSinceStart <= TRIAL_PERIOD_DAYS) {
            // If still within the trial period, allow the request.
            return next();
        } else {
            // If the trial has expired, automatically set the status to inactive.
            await Setting.updateOne({ key: 'licenseStatus' }, { $set: { value: 'inactive' } }, { upsert: true });
            res.status(403); // 403 Forbidden
            throw new Error('Trial period has expired. Please contact support to activate your license.');
        }
    }

    // If status is 'inactive' or anything else, block the request.
    res.status(403);
    throw new Error('License is inactive. Please contact support.');
});

export default checkLicense;