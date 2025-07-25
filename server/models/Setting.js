import mongoose from 'mongoose';
const settingSchema = mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
});
const Setting = mongoose.model('Setting', settingSchema);
export default Setting;