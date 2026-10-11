import mongoose from 'mongoose';

const journeySchema = new mongoose.Schema(
  {
    journeyId: {
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
    destination: {
      name: { type: String, required: true },
      address: { type: String, default: '' },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    startLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'overdue', 'escalated'],
      default: 'active',
      index: true,
    },
    expectedDurationMinutes: {
      type: Number,
      required: true,
    },
    checkInIntervalMinutes: {
      type: Number,
      default: 15,
    },
    expectedArrivalTime: {
      type: Date,
      required: true,
    },
    lastCheckInTime: {
      type: Date,
      default: Date.now,
    },
    nextCheckInDue: {
      type: Date,
    },
    selectedContacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrustedContact',
      },
    ],
    lastKnownLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
      timestamp: { type: Date, default: Date.now },
    },
    routeTrail: [
      {
        latitude: { type: Number },
        longitude: { type: Number },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    checkInHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        type: { type: String, enum: ['manual', 'auto_ping', 'arrival'], default: 'manual' },
        note: { type: String, default: 'Confirmed safe' },
        location: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
      },
    ],
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

journeySchema.index({ userId: 1, createdAt: -1 });

export const Journey = mongoose.model('Journey', journeySchema);
