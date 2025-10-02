import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.js';

export interface JwtPayload {
  userId: string;
  email: string;
  [key: string]: unknown;
}

export function generateToken(
  payload: JwtPayload,
  expiresIn: string = config.jwt.expiresIn,
): string {
  return jwt.sign(payload, config.jwt.secret, { expiresIn } as SignOptions);
}

export function validateToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token validation failed');
  }
}
