import { z } from 'zod';

export const startJourneySchema = z.object({
  destination: z.object({
    name: z.string().min(1, 'Destination name is required').max(150),
    address: z.string().max(250).optional().default(''),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
  startLocation: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    address: z.string().max(250).optional().default(''),
  }).optional(),
  expectedDurationMinutes: z.number().int().min(1).max(1440), // up to 24 hrs
  checkInIntervalMinutes: z.number().int().min(5).max(180).optional().default(15),
  selectedContacts: z.array(z.string()).optional().default([]),
});

export const journeyCheckInSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  note: z.string().max(200).optional().default('I am safe'),
});
