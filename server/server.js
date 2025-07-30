// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import startAutomaticReminders from './services/automaticReminderService.js';
//import checkLicense from './middleware/licenseMiddleware.js';

// --- MAIN STARTUP FUNCTION ---
const startServer = async () => {
    // Step 1: Configure environment variables. This runs first.
    dotenv.config();

    // Step 2: Connect to the database.
    await connectDB();

    // Step 3: Dynamically import routes AFTER dotenv is configured.
    // This ensures that any config files loaded by these routes have access to process.env
    const authRoutes = (await import('./routes/authRoutes.js')).default;
    const vehicleRoutes = (await import('./routes/vehicleRoutes.js')).default;
    const inspectionRoutes = (await import('./routes/inspectionRoutes.js')).default;
    const certificateRoutes = (await import('./routes/certificateRoutes.js')).default;
    const userRoutes = (await import('./routes/userRoutes.js')).default;
    const notificationRoutes = (await import('./routes/notificationRoutes.js')).default;
    const reportRoutes = (await import('./routes/reportRoutes.js')).default;
    const adminRoutes = (await import('./routes/adminRoutes.js')).default;
    const settingRoutes = (await import('./routes/settingRoutes.js')).default;
    const scheduleNotificationChecks = (await import('./services/notificationScheduler.js')).default;

    // Step 4: Create and configure the Express app.
    const app = express();
    startAutomaticReminders();
    app.use(cors());
    app.use(express.json());

    // Step 5: Start background services like the cron job.
    scheduleNotificationChecks();

    // Step 6: Mount all the routes.
    app.use('/api/admin', adminRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/vehicles', vehicleRoutes);
    app.use('/api/inspections', inspectionRoutes);
    app.use('/api/certificate', certificateRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/settings', settingRoutes);
   // app.use(checkLicense);

    // Step 7: Configure error handling middleware.
    app.use((err, req, res, next) => {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode);
        res.json({
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        });
    });

    // Step 8: Start listening for requests.
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        logServiceStatus(); // Log status after server is up
    });
};

// Function to log the status of external services
const logServiceStatus = () => {
    console.log('--- Service Configuration Status ---');
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        console.log('✅ Cloudinary configured successfully.');
    } else {
        console.log('❌ Cloudinary configuration missing or incomplete.');
    }
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log(`✅ Email service configured for host: ${process.env.EMAIL_HOST}`);
    } else {
        console.log('❌ Email service configuration missing or incomplete.');
    }
    // Update this line based on which WhatsApp provider you are using
    if (process.env.TWILIO_ACCOUNT_SID) {
        console.log('✅ Twilio (WhatsApp) configured successfully.');
    } else if (process.env.DIALOG360_API_KEY) {
        console.log('✅ 360dialog (WhatsApp) configured successfully.');
    } else {
        console.log('❌ WhatsApp service credentials are missing.');
    }
    console.log('------------------------------------');
};

// --- INITIATE THE SERVER STARTUP ---
startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});