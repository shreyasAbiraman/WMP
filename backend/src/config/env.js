import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/women_safety_shield',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'women_safety_shield_access_jwt_secret_key_super_secure_32bytes_min',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'women_safety_shield_refresh_jwt_secret_key_super_secure_32bytes_min',
  jwtAccessExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax',
  aiProviderApiKey: process.env.AI_PROVIDER_API_KEY || '',
  emailProviderApiKey: process.env.EMAIL_PROVIDER_API_KEY || '',
  smsProviderApiKey: process.env.SMS_PROVIDER_API_KEY || '',
  pushNotificationConfig: process.env.PUSH_NOTIFICATION_CONFIG || '',
  // Twilio Gateway
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
};
