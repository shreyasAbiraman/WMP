import mongoose from 'mongoose';

const locationShareSessionSchema = new mongoose.Schema(
  {
    sessionId: {
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
    shareCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Live Safety Location Share',
    },
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
      timestamp: { type: Date, default: Date.now },
    },
    locationTrail: [
      {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        accuracy: { type: Number },
        recordedAt: { type: Date, default: Date.now },
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

locationShareSessionSchema.index({ userId: 1, isActive: 1 });

export const LocationShareSession = mongoose.model('LocationShareSession', locationShareSessionSchema);
