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
        // --- THIS IS THE SECURE CHANGE ---
        // Check if the required environment variables are set
        if (!process.env.DEFAULT_ADMIN_EMAIL || !process.env.DEFAULT_ADMIN_PASSWORD) {
            console.error('Error: Please set DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD in your .env file'.red.bold);
            process.exit(1);
        }

        // Clear existing users to prevent duplicates
        await User.deleteMany();

        // Create the admin user by reading from environment variables
        const adminUser = new User({
            name: process.env.DEFAULT_ADMIN_NAME || 'Admin User',
            email: process.env.DEFAULT_ADMIN_EMAIL,
            password: process.env.DEFAULT_ADMIN_PASSWORD,
            role: 'admin',
        });

        await adminUser.save();

        console.log('Admin user created successfully!'.green.inverse);
        console.log(`Email: ${process.env.DEFAULT_ADMIN_EMAIL}`.cyan);
        console.log(`Password: [set from your .env file]`.cyan);
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