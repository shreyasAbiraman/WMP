import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(7, 'Phone number must be at least 7 characters').max(20),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must match'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phoneNumber: z.string().min(7).max(20).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  preferences: z.object({
    defaultEmergencyChannel: z.enum(['sms', 'call', 'app', 'all']).optional(),
    shakeDetectionEnabled: z.boolean().optional(),
    shakeSensitivity: z.number().min(5).max(40).optional(),
    shakeSensitivityLevel: z.enum(['low', 'medium', 'high']).optional(),
    shakeTestMode: z.boolean().optional(),
    volumeButtonSosEnabled: z.boolean().optional(),
    autoAudioRecordOnSOS: z.boolean().optional(),
    countdownDurationSeconds: z.number().min(0).max(30).optional(),
    shareLocationWithContacts: z.boolean().optional(),
  }).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmNewPassword: z.string().min(8, 'Confirm password must match'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ['confirmNewPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmNewPassword: z.string().min(8, 'Confirm password must match'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ['confirmNewPassword'],
});
