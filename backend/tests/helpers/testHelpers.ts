import { vi } from 'vitest';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../../src/config/env.js';
import User from '../../src/db/models/User.js';
import bcrypt from 'bcrypt';

export async function createTestUser(
  userData: {
    email?: string;
    password?: string;
    fullName?: string;
  } = {},
) {
  const defaultData = {
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
  };

  const mergedData = { ...defaultData, ...userData };
  const hashedPassword = await bcrypt.hash(mergedData.password, 10);

  const user = await User.create({
    email: mergedData.email,
    password: hashedPassword,
    fullName: mergedData.fullName,
  });

  return { user, password: mergedData.password };
}

export function generateTestToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as SignOptions);
}

export function mockRequest(overrides = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: undefined,
    protocol: 'http',
    get: (key: string) => {
      if (key === 'host') return 'localhost:3000';
      return undefined;
    },
    ...overrides,
  };
}

export function mockResponse() {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
}

export function mockNext() {
  return vi.fn();
}
