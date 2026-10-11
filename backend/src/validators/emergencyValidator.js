import { z } from 'zod';

export const triggerEmergencySchema = z.object({
  incidentType: z.enum(['sos_button', 'shake_gesture', 'voice_trigger', 'safe_journey_alert', 'manual_panic', 'volume_button']).optional().default('sos_button'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  accuracy: z.number().min(0).optional(),
  address: z.string().max(250).optional(),
  emergencyDialerOpened: z.boolean().optional(),
});

export const updateLocationTrailSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
});

export const resolveIncidentSchema = z.object({
  resolutionNotes: z.string().max(500).optional().default(''),
});

export const acknowledgeAlertSchema = z.object({
  contactName: z.string().min(1).max(100),
  note: z.string().max(250).optional().default(''),
});
