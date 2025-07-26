// server/models/Setting.js
import mongoose from 'mongoose';

const settingSchema = mongoose.Schema({
    key: { type: String, required: true, unique: true },
    // Use a flexible type for the value to store strings, dates, etc.
    value: { type: mongoose.Schema.Types.Mixed, required: true },
});

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;