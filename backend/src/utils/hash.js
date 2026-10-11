import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const calculateSha256 = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

export const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};
