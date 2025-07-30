// server/services/emailService.js
import nodemailer from 'nodemailer';
import { format } from 'date-fns';
import Setting from '../models/Setting.js'; // Import the Setting model

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
        console.log(`✅ Email sent successfully to ${to}`);
        return true;
    } catch (error) {
        console.error(`❌ Error sending email to ${to}:`, error);
        return false;
    }
};

// Welcome and Failed messages are simple and can remain hardcoded for reliability
export const sendWelcomeEmail = (to, ownerName) => {
    const subject = "Welcome to VisuTech!";
    const html = `<p>Dear ${ownerName},</p><p>Thank you for choosing VisuTech. Your vehicle is now being inspected and should be ready in approximately 20 minutes.</p>`;
    return sendEmail(to, subject, html);
};
export const sendFailedInspectionEmail = (to, ownerName, licensePlate) => {
    const subject = `Important: Inspection Result for ${licensePlate}`;
    const html = `<p>Dear ${ownerName},</p><p>The technical inspection for your vehicle ${licensePlate} has unfortunately failed. Please consult with your inspector for details.</p>`;
    return sendEmail(to, subject, html);
};

// --- THIS IS THE DYNAMIC FUNCTION ---
export const sendDueDateReminderEmail = async (to, ownerName, licensePlate, dueDate) => {
    // Fetch all settings at once for efficiency
    const settings = await Setting.find({ key: { $in: ['emailReminderSubject', 'emailReminderBody'] } });
    const subjectTemplate = settings.find(s => s.key === 'emailReminderSubject')?.value || "Reminder for {{vehiclePlate}}";
    const bodyTemplate = settings.find(s => s.key === 'emailReminderBody')?.value || "<p>Dear {{ownerName}}, your inspection is due.</p>";

    const formattedDate = format(new Date(dueDate), 'MMMM do, yyyy');

    // Replace placeholders in the templates fetched from the database
    const subject = subjectTemplate.replace('{{vehiclePlate}}', licensePlate);
    const html = bodyTemplate
        .replace(new RegExp('{{ownerName}}', 'g'), ownerName)
        .replace(new RegExp('{{vehiclePlate}}', 'g'), licensePlate)
        .replace(new RegExp('{{dueDate}}', 'g'), formattedDate);

    return sendEmail(to, subject, html);
};
export const sendPassedInspectionEmail = (to, ownerName, licensePlate, nextDueDate) => {
    const formattedDate = format(new Date(nextDueDate), 'MMMM do, yyyy');
    const subject = `Congratulations: Your Vehicle Inspection Passed for ${licensePlate}`;
    const html = `<p>Dear ${ownerName},</p><p>Great news! The technical inspection for your vehicle ${licensePlate} has passed. Your next inspection is due on <strong>${formattedDate}</strong>.</p><p>Thank you for choosing VisuTech.</p>`;
    return sendEmail(to, subject, html);
};