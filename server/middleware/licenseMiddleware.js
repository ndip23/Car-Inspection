// server/middleware/licenseMiddleware.js
import asyncHandler from 'express-async-handler';
import Setting from '../models/Setting.js';
import { differenceInDays } from 'date-fns';

const TRIAL_PERIOD_DAYS = 14;

const checkLicense = asyncHandler(async (req, res, next) => {
    console.log(`--- LICENSE CHECK for URL: ${req.originalUrl} ---`);
    try {
        const licenseStatusSetting = await Setting.findOne({ key: 'licenseStatus' });

        if (!licenseStatusSetting) {
            console.log('License status not found, allowing request to pass for initialization.');
            return next();
        }

        const licenseStatus = licenseStatusSetting.value;
        console.log(`Current license status is: ${licenseStatus}`);

        if (licenseStatus === 'active') {
            console.log('License is active. Allowing request.');
            return next();
        }

        if (licenseStatus === 'trial') {
            const trialStartDateSetting = await Setting.findOne({ key: 'trialStartDate' });
            if (!trialStartDateSetting) {
                console.log('Trial status, but no start date found. Allowing request for initialization.');
                return next();
            }

            const daysSinceStart = differenceInDays(new Date(), new Date(trialStartDateSetting.value));
            console.log(`Days since trial start: ${daysSinceStart}`);

            if (daysSinceStart <= TRIAL_PERIOD_DAYS) {
                console.log('Within trial period. Allowing request.');
                return next();
            }
        }

        console.log('!!! BLOCKING REQUEST: Trial expired or license inactive. !!!');
        res.status(403);
        throw new Error('Trial period has expired or license is inactive. Please contact support.');

    } catch (error) {
        console.error('!!! CRASH IN licenseMiddleware !!!', error);
        // Pass the original error message if it exists
        throw new Error(error.message || 'Server error in licenseMiddleware.');
    }
});

export default checkLicense;