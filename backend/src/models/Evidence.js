import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema(
  {
    evidenceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyIncident',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Evidence title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    originalFileName: {
      type: String,
      required: true,
    },
    storedFileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
    sha256Hash: {
      type: String,
      required: true,
    },
    fileCategory: {
      type: String,
      enum: ['image', 'audio', 'video', 'document', 'other'],
      default: 'image',
    },
    capturedLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

evidenceSchema.index({ userId: 1, createdAt: -1 });

export const Evidence = mongoose.model('Evidence', evidenceSchema);
