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
        // Check if the required environment variables are set
        if (!process.env.DEFAULT_ADMIN_EMAIL || !process.env.DEFAULT_ADMIN_PASSWORD || !process.env.DEFAULT_DEV_EMAIL || !process.env.DEFAULT_DEV_PASSWORD) {
            console.error('Error: Please set DEFAULT_ADMIN_EMAIL/PASSWORD and DEFAULT_DEV_EMAIL/PASSWORD in your .env file'.red.bold);
            process.exit(1);
        }

        // Clear existing users to prevent duplicates
        await User.deleteMany();

        // --- UPDATED: Create an array of users ---
        const usersToCreate = [
            // User 1: The regular Admin
            {
                name: process.env.DEFAULT_ADMIN_NAME || 'Admin User',
                email: process.env.DEFAULT_ADMIN_EMAIL,
                password: process.env.DEFAULT_ADMIN_PASSWORD,
                role: 'admin',
            },
            // User 2: The special Developer account (also an admin)
            {
                name: process.env.DEFAULT_DEV_NAME || 'Developer',
                email: process.env.DEFAULT_DEV_EMAIL,
                password: process.env.DEFAULT_DEV_PASSWORD,
                role: 'admin', // The developer account must also be an admin to access the admin panel
            }
        ];

        // Insert both users into the database
        await User.insertMany(usersToCreate);

        console.log('Admin and Developer users created successfully!'.green.inverse);
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