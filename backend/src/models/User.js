import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    preferences: {
      defaultEmergencyChannel: {
        type: String,
        enum: ['sms', 'call', 'app', 'all'],
        default: 'all',
      },
      shakeDetectionEnabled: {
        type: Boolean,
        default: false,
      },
      shakeSensitivity: {
        type: Number,
        default: 18, // threshold in m/s²
      },
      shakeSensitivityLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      shakeTestMode: {
        type: Boolean,
        default: false,
      },
      volumeButtonSosEnabled: {
        type: Boolean,
        default: false,
      },
      autoAudioRecordOnSOS: {
        type: Boolean,
        default: false,
      },
      countdownDurationSeconds: {
        type: Number,
        default: 5,
      },
      shareLocationWithContacts: {
        type: Boolean,
        default: true,
      },
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokenHash;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

export const User = mongoose.model('User', userSchema);
