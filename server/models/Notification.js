// server/models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Vehicle' },
    inspection: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Inspection' },
    dueDate: { type: Date, required: true },
    message: { type: String, required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ['pending', 'sent', 'acknowledged'], 
        default: 'pending' 
    },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;