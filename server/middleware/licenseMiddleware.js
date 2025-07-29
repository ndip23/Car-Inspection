// server/middleware/licenseMiddleware.js
import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';
import { differenceInDays } from 'date-fns';

const TRIAL_PERIOD_DAYS = 14;

const checkLicense = asyncHandler(async (req, res, next) => {
    try {
        const licenseStatusSetting = await Setting.findOne({ key: 'licenseStatus' });
        
        // If the license status has never been set, we assume it's a new installation
        // and allow the request to proceed. The getSettings controller will create it.
        if (!licenseStatusSetting) {
            return next();
        }

        const licenseStatus = licenseStatusSetting.value;

        if (licenseStatus === 'active') {
            return next(); // License is active, proceed.
        }

        if (licenseStatus === 'trial') {
            const trialStartDateSetting = await Setting.findOne({ key: 'trialStartDate' });
            
            // If in trial but no start date, let it pass for initialization.
            if (!trialStartDateSetting) return next();

            const daysSinceStart = differenceInDays(new Date(), new Date(trialStartDateSetting.value));
            
            if (daysSinceStart <= TRIAL_PERIOD_DAYS) {
                return next(); // Still within the trial period.
            }
        }

        // If we reach here, the license is either 'inactive' or the trial has expired. Block access.
        res.status(403);
        throw new Error('License is inactive or trial has expired. Please contact support.');

    } catch (error) {
        // This will catch any unexpected database errors during the check.
        res.status(500);
        throw new Error(error.message || 'Server error while checking license.');
    }
});

export default checkLicense;