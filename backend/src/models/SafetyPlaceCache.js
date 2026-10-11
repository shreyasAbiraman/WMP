import mongoose from 'mongoose';

const safetyPlaceCacheSchema = new mongoose.Schema(
  {
    placeId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['police', 'hospital', 'pharmacy', 'fire_station', 'women_help_center', 'public_safe_point'],
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    openingHours: {
      type: String,
      default: '24/7',
    },
    cachedAt: {
      type: Date,
      default: Date.now,
      expires: 86400 * 7, // auto purge after 7 days
    },
  },
  {
    timestamps: true,
  }
);

safetyPlaceCacheSchema.index({ location: '2dsphere' });

export const SafetyPlaceCache = mongoose.model('SafetyPlaceCache', safetyPlaceCacheSchema);
