// server/middleware/licenseMiddleware.js
import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';
import { differenceInDays } from 'date-fns';

const TRIAL_PERIOD_DAYS = 14;

const checkLicense = asyncHandler(async (req, res, next) => {
    // --- THIS IS THE NEW, SIMPLIFIED LOGIC ---
    // The middleware now only has ONE job: read the license status and block if necessary.
    // It no longer tries to create or modify settings.

    const licenseStatusSetting = await Setting.findOne({ key: 'licenseStatus' });

    // If the setting doesn't exist yet, allow the request to pass.
    // The getSettings controller will create it. This prevents the circular error.
    if (!licenseStatusSetting) {
        return next();
    }

    const licenseStatus = licenseStatusSetting.value;

    // If the license is active, allow the request.
    if (licenseStatus === 'active') {
        return next();
    }

    // If the license is in trial, check the start date.
    if (licenseStatus === 'trial') {
        const trialStartDateSetting = await Setting.findOne({ key: 'trialStartDate' });
        
        // If the start date doesn't exist for some reason, let it pass for now.
        if (!trialStartDateSetting) {
            return next();
        }

        const daysSinceStart = differenceInDays(new Date(), new Date(trialStartDateSetting.value));
        if (daysSinceStart <= TRIAL_PERIOD_DAYS) {
            return next(); // Still in trial, allow request.
        }
    }

    // If we reach this point, the trial has expired or the license is inactive. Block the request.
    res.status(403); // 403 Forbidden
    throw new Error('Trial period has expired or license is inactive. Please contact support.');
});

export default checkLicense;