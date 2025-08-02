// server/services/emailService.js
import nodemailer from 'nodemailer';
import { format } from 'date-fns';
import Setting from '../models/Setting.js';

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

// Helper to fetch a specific template with a safe fallback
const getTemplate = async (key, fallback) => {
    const setting = await Setting.findOne({ key: key });
    return setting ? setting.value : fallback;
};

export const sendWelcomeEmail = async (to, ownerName) => {
    const template = await getTemplate('welcomeMessage', "Welcome to Harmony Inspection, {{customerName}}! Your vehicle is being inspected.");
    const subject = "Welcome to Harmony Inspection!";
    const html = `<p>${template.replace(new RegExp('{{customerName}}', 'g'), ownerName)}</p>`;
    return sendEmail(to, subject, html);
};

export const sendPassedInspectionEmail = async (to, ownerName, licensePlate, nextDueDate) => {
    const template = await getTemplate('passedMessage', "Congratulations, {{customerName}}! Your vehicle {{licensePlate}} passed. Next inspection is due on {{nextDueDate}}.");
    const subject = `Inspection Passed for ${licensePlate}`;
    const formattedDate = format(new Date(nextDueDate), 'MMMM do, yyyy');
    const html = `<p>${template
        .replace(new RegExp('{{customerName}}', 'g'), ownerName)
        .replace(new RegExp('{{licensePlate}}', 'g'), licensePlate)
        .replace(new RegExp('{{nextDueDate}}', 'g'), formattedDate)}</p>`;
    return sendEmail(to, subject, html);
};

export const sendFailedInspectionEmail = async (to, ownerName, licensePlate) => {
    const template = await getTemplate('failedMessage', "Dear {{customerName}}, the inspection for your vehicle {{licensePlate}} has failed.");
    const subject = `Important: Inspection Result for ${licensePlate}`;
    const html = `<p>${template
        .replace(new RegExp('{{customerName}}', 'g'), ownerName)
        .replace(new RegExp('{{licensePlate}}', 'g'), licensePlate)}</p>`;
    return sendEmail(to, subject, html);
};

export const sendDueDateReminderEmail = async (to, ownerName, licensePlate, dueDate) => {
    const subjectTemplate = await getTemplate('emailReminderSubject', "Reminder for {{vehiclePlate}}");
    const bodyTemplate = await getTemplate('emailReminderBody', "<p>Dear {{customerName}}, your inspection is due.</p>");

    const formattedDate = format(new Date(dueDate), 'MMMM do, yyyy');
    const subject = subjectTemplate.replace(new RegExp('{{vehiclePlate}}', 'g'), licensePlate);
    const html = bodyTemplate
        .replace(new RegExp('{{customerName}}', 'g'), ownerName)
        .replace(new RegExp('{{vehiclePlate}}', 'g'), licensePlate)
        .replace(new RegExp('{{dueDate}}', 'g'), formattedDate);

    return sendEmail(to, subject, html);
};