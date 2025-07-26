// server/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['inspector', 'admin'],
      default: 'inspector',
    },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

// This function for comparing passwords during login is correct and remains the same.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- THIS IS THE CORRECTED SECTION ---
// We are making the pre-save hook for hashing the password more robust.
// This ensures that whenever a new user is created OR an existing user's
// password is changed, it gets hashed correctly.
userSchema.pre('save', async function (next) {
  // The 'isModified' check ensures we only re-hash the password if it has changed.
  // This prevents issues if a user's name or email is updated.
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
// ------------------------------------

const User = mongoose.model('User', userSchema);
export default User;