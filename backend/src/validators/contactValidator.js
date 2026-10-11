import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  relationship: z.enum(['parent', 'spouse', 'partner', 'sibling', 'friend', 'colleague', 'guardian', 'other']),
  phoneNumber: z.string().min(7, 'Phone number must be at least 7 characters').max(20),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
  preferredNotifyMethod: z.enum(['sms', 'whatsapp', 'call', 'app', 'email']).optional().default('sms'),
  priorityOrder: z.number().int().min(1).max(10).optional().default(1),
});

export const updateContactSchema = contactSchema.partial();
