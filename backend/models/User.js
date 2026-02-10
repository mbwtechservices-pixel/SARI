import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500,
  },
  accountMode: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  themeColors: {
    primary: {
      type: String,
      default: '#6366f1',
    },
    secondary: {
      type: String,
      default: '#8b5cf6',
    },
    tertiary: {
      type: String,
      default: '#ec4899',
    },
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: String,
    expiresAt: Date,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  onlineStatus: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline',
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

