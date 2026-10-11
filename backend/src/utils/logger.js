const sanitize = (data) => {
  if (!data || typeof data !== 'object') return data;
  const copy = Array.isArray(data) ? [...data] : { ...data };
  const sensitiveKeys = ['password', 'confirmPassword', 'passwordHash', 'token', 'refreshToken', 'jwt'];
  
  for (const key of Object.keys(copy)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      copy[key] = '[REDACTED]';
    } else if (typeof copy[key] === 'object') {
      copy[key] = sanitize(copy[key]);
    }
  }
  return copy;
};

export const logger = {
  info: (msg, meta) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta ? sanitize(meta) : '');
  },
  warn: (msg, meta) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta ? sanitize(meta) : '');
  },
  error: (msg, meta) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, meta ? sanitize(meta) : '');
  },
  emergency: (msg, meta) => {
    console.error(`[🚨 EMERGENCY] ${new Date().toISOString()} - ${msg}`, meta ? sanitize(meta) : '');
  },
};
