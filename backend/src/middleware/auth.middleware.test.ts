import { describe, it, expect, vi } from 'vitest';
import { authenticate } from './auth.middleware.js';
import {
  createTestUser,
  generateTestToken,
  mockRequest,
  mockResponse,
  mockNext,
} from '../../tests/helpers/testHelpers.js';

describe('Auth Middleware', () => {
  describe('authenticate', () => {
    it('should return 401 if no authorization header', () => {
      const req = mockRequest({ headers: {} });
      const res = mockResponse();
      const next = mockNext();

      authenticate(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No token provided',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', () => {
      const req = mockRequest({
        headers: { authorization: 'InvalidToken123' },
      });
      const res = mockResponse();
      const next = mockNext();

      authenticate(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No token provided',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer invalid-token' },
      });
      const res = mockResponse();
      const next = mockNext();

      authenticate(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is expired', () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      const req = mockRequest({
        headers: { authorization: `Bearer ${expiredToken}` },
      });
      const res = mockResponse();
      const next = mockNext();

      authenticate(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should attach user to request and call next with valid token', async () => {
      const { user } = await createTestUser();
      const token = generateTestToken(user._id.toString(), user.email);
      interface AuthenticatedRequest {
        user?: {
          userId: string;
          email: string;
        };
        [key: string]: any;
      }

      const req: AuthenticatedRequest = mockRequest({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = mockResponse();
      const next = mockNext();

      authenticate(req as any, res as any, next);

      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe(user._id.toString());
      expect(req.user?.email).toBe(user.email);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle Bearer token with extra spaces', async () => {
      const { user } = await createTestUser();
      const token = generateTestToken(user._id.toString(), user.email);
      const req = mockRequest({
        headers: { authorization: `Bearer  ${token}` },
      });
      const res = mockResponse();
      const next = mockNext();

      authenticate(req as any, res as any, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
