// server/models/Setting.js
import mongoose from 'mongoose';

const settingSchema = mongoose.Schema({
    // The 'key' is the field that must be unique.
    // For example, there can only be ONE 'licenseStatus' setting.
    key: { 
        type: String, 
        required: true, 
        unique: true, // <-- This is the correct unique index
        index: true   // Add an index for faster lookups
    },
    
    // The 'value' can be anything (string, date, etc.)
    value: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true 
    },

    // We do NOT need a 'singletonKey' or any other unique field.
});

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;