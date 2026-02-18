import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Generate verification token (for email verification)
 */
export function generateVerificationToken(): string {
  return jwt.sign({ type: 'verification' }, config.jwtSecret, {
    expiresIn: '24h',
  });
}

/**
 * Generate password reset token
 */
export function generateResetToken(): string {
  return jwt.sign({ type: 'reset' }, config.jwtSecret, {
    expiresIn: '1h',
  });
}
