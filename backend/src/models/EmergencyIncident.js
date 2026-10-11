import mongoose from 'mongoose';

const emergencyIncidentSchema = new mongoose.Schema(
  {
    incidentId: {
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
    incidentType: {
      type: String,
      enum: ['sos_button', 'shake_gesture', 'voice_trigger', 'safe_journey_alert', 'manual_panic', 'volume_button'],
      default: 'sos_button',
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'cancelled'],
      default: 'active',
      index: true,
    },
    latestLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
      address: { type: String, default: '' },
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
    notifications: [
      {
        contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrustedContact' },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        channel: { type: String, enum: ['sms', 'email', 'app', 'call'], default: 'sms' },
        status: {
          type: String,
          enum: ['pending', 'sent', 'delivered', 'failed', 'acknowledged'],
          default: 'pending',
        },
        sentAt: { type: Date },
        deliveredAt: { type: Date },
        errorMessage: { type: String },
      },
    ],
    acknowledgements: [
      {
        contactName: { type: String, required: true },
        contactPhone: { type: String },
        acknowledgedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    resolvedAt: {
      type: Date,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    emergencyDialerOpened: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

emergencyIncidentSchema.index({ userId: 1, createdAt: -1 });

export const EmergencyIncident = mongoose.model('EmergencyIncident', emergencyIncidentSchema);
