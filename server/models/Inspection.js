// server/models/Inspection.js
import mongoose from 'mongoose';

const inspectionSchema = mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Vehicle' },
    date: { type: Date, required: true, default: Date.now },
    inspector_name: { type: String, required: true },
    result: { type: String, required: true, enum: ['pass', 'fail'] },
    notes: { type: String, default: '' },
    next_due_date: { type: Date, required: true },
  },
  { timestamps: true }
);

const Inspection = mongoose.model('Inspection', inspectionSchema);
export default Inspection;