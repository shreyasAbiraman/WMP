import mongoose from 'mongoose';

const trustedContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      maxlength: 100,
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      enum: ['parent', 'spouse', 'partner', 'sibling', 'friend', 'colleague', 'guardian', 'other'],
      default: 'family',
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    preferredNotifyMethod: {
      type: String,
      enum: ['sms', 'whatsapp', 'call', 'app', 'email'],
      default: 'sms',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    priorityOrder: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

trustedContactSchema.index({ userId: 1, phoneNumber: 1 });

export const TrustedContact = mongoose.model('TrustedContact', trustedContactSchema);
