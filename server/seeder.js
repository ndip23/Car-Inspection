// server/seeder.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
    try {
        // Check for required environment variables
        if (!process.env.DEFAULT_ADMIN_EMAIL || !process.env.DEFAULT_ADMIN_PASSWORD || !process.env.DEFAULT_DEV_EMAIL || !process.env.DEFAULT_DEV_PASSWORD) {
            console.error('Error: Please set all DEFAULT_ADMIN and DEFAULT_DEV credentials in your .env file'.red.bold);
            process.exit(1);
        }

        // Clear all existing users
        await User.deleteMany();
        console.log('Existing users cleared...'.yellow);

        // --- THIS IS THE CRITICAL FIX ---
        // We create each user individually using User.create()
        // This ensures the pre('save') hook in the User model runs and hashes the password.

        // Create the Admin User
        await User.create({
            name: process.env.DEFAULT_ADMIN_NAME || 'Admin User',
            email: process.env.DEFAULT_ADMIN_EMAIL,
            password: process.env.DEFAULT_ADMIN_PASSWORD,
            role: 'admin',
        });
        console.log('Admin User created.'.green);

        // Create the Developer User
        await User.create({
            name: process.env.DEFAULT_DEV_NAME || 'Developer',
            email: process.env.DEFAULT_DEV_EMAIL,
            password: process.env.DEFAULT_DEV_PASSWORD,
            role: 'admin',
        });
        console.log('Developer User created.'.green);
        // ------------------------------------

        console.log('\nAdmin and Developer users created successfully!'.green.inverse);
        console.log('--- Admin Account ---'.cyan);
        console.log(`Email: ${process.env.DEFAULT_ADMIN_EMAIL}`.cyan);
        console.log(`Password: [set from your .env file]`.cyan);
        console.log('--- Developer Account ---'.yellow);
        console.log(`Email: ${process.env.DEFAULT_DEV_EMAIL}`.yellow);
        console.log(`Password: [set from your .env file]`.yellow);

        process.exit();

    } catch (error) {
        console.error(`Error: ${error.message}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        console.log('All user data destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}