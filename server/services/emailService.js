// server/services/emailService.js
import nodemailer from 'nodemailer';
import { format } from 'date-fns';

// UPDATED: The transport configuration is now more robust
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    // --- THIS IS THE FIX ---
    // Add a DNS timeout to prevent the ECONNREFUSED error on some systems.
    // This gives Node.js more time to correctly resolve smtp.gmail.com.
    dnsTimeout: 30000 // 30 seconds
});

export const sendInspectionReminder = async (ownerEmail, ownerName, vehiclePlate, dueDate) => {
    const formattedDate = format(new Date(dueDate), 'MMMM do, yyyy');

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: ownerEmail,
        subject: `Upcoming Vehicle Inspection Reminder for ${vehiclePlate}`,
        html: `
            <p>Dear ${ownerName},</p>
            <p>This is a friendly reminder that your vehicle with license plate <strong>${vehiclePlate}</strong> is due for its next technical inspection on <strong>${formattedDate}</strong>.</p>
            <p>Please schedule your appointment with VisuTech soon.</p>
            <p>Thank you,</p>
            <p><strong>The VisuTech Team</strong></p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Reminder email SENT VIA GMAIL to ${ownerEmail}`);
        return true;
    } catch (error) {
        console.error(`❌ Error sending Gmail to ${ownerEmail}:`, error);
        return false;
    }
};