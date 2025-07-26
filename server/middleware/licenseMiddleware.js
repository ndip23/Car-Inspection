// server/middleware/licenseMiddleware.js
import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';
import { differenceInDays } from 'date-fns';

const TRIAL_PERIOD_DAYS = 14;

const checkLicense = asyncHandler(async (req, res, next) => {
    // Allow critical routes to pass without a license check
    const allowedPaths = ['/api/auth/login', '/api/settings'];
    if (allowedPaths.some(path => req.originalUrl.startsWith(path))) {
        return next();
    }
    
    const licenseStatusSetting = await Setting.findOne({ key: 'licenseStatus' });
    const trialStartDateSetting = await Setting.findOne({ key: 'trialStartDate' });

    // If settings don't exist yet, block access until an admin logs in and saves them.
    if (!licenseStatusSetting || !trialStartDateSetting) {
        res.status(403);
        throw new Error('System not configured. Please contact support.');
    }

    const licenseStatus = licenseStatusSetting.value;
    const trialStartDate = trialStartDateSetting.value;

    if (licenseStatus === 'active') {
        return next();
    }

    if (licenseStatus === 'trial') {
        const daysSinceStart = differenceInDays(new Date(), new Date(trialStartDate));
        if (daysSinceStart <= TRIAL_PERIOD_DAYS) {
            return next();
        } else {
            // NOTE: We no longer automatically change the status here. The banner will just show "expired".
            // The developer must manually set it to "inactive" or "active".
            res.status(403);
            throw new Error('Trial period has expired. Please contact support to activate your license.');
        }
    }

    res.status(403);
    throw new Error('License is inactive. Please contact support.');
});

export default checkLicense;