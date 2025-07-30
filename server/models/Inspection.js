// server/models/Inspection.js
import mongoose from 'mongoose';

const inspectionSchema = mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Vehicle' },
    date: { type: Date, required: true, default: Date.now },
    
    // --- THIS IS THE CORRECTED FIELD ---
    // We are now storing a link (reference) to the User model.
    inspector: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    
    result: { type: String, required: true, enum: ['pass', 'fail'] },
    notes: { type: String, default: '' },
    next_due_date: { type: Date, required: true },
  },
  { timestamps: true }
);

const Inspection = mongoose.model('Inspection', inspectionSchema);
export default Inspection;