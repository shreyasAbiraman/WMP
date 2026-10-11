import { z } from 'zod';

export const startLocationSessionSchema = z.object({
  title: z.string().max(100).optional().default('Live Safety Location Share'),
  durationMinutes: z.number().int().min(5).max(720).optional().default(60), // default 1 hour
  initialCoordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().min(0).optional(),
  }).optional(),
});

export const updateCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
});
