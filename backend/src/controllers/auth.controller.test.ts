import { type Request, type Response } from 'express';
import { describe, it, expect } from 'vitest';
import {
  login,
  register,
  getCurrentUser,
  updateProfileImage,
  updateCoverImage,
} from './auth.controller.js';
import User from '../db/models/User.js';
import {
  createTestUser,
  mockRequest,
  mockResponse,
} from '../../tests/helpers/testHelpers.js';
import bcrypt from 'bcrypt';

describe('Auth Controller', () => {
  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      const req = mockRequest({ body: {} });
      const res = mockResponse();

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email and password are required',
      });
    });

    it('should return 401 if user does not exist', async () => {
      const req = mockRequest({
        body: { email: 'nonexistent@example.com', password: 'password123' },
      });
      const res = mockResponse();

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });

    it('should return 401 if password is invalid', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        body: { email: user.email, password: 'wrongpassword' },
      });
      const res = mockResponse();

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });

    it('should return 200 with token and user data on successful login', async () => {
      const { user, password } = await createTestUser();
      const req = mockRequest({
        body: { email: user.email, password },
      });
      const res = mockResponse();

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            token: expect.any(String),
            user: expect.objectContaining({
              id: user._id,
              email: user.email,
              fullName: user.fullName,
            }),
          }),
        }),
      );
    });
  });

  describe('register', () => {
    it('should return 400 if required fields are missing', async () => {
      const req = mockRequest({ body: { email: 'test@example.com' } });
      const res = mockResponse();

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email, password, and full name are required',
      });
    });

    it('should return 409 if user already exists', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        body: {
          email: user.email,
          password: 'password123',
          fullName: 'Test User',
        },
      });
      const res = mockResponse();

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User already exists',
      });
    });

    it('should return 201 with token and user data on successful registration', async () => {
      const req = mockRequest({
        body: {
          email: 'newuser@example.com',
          password: 'password123',
          fullName: 'New User',
        },
      });
      const res = mockResponse();

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            token: expect.any(String),
            user: expect.objectContaining({
              email: 'newuser@example.com',
              fullName: 'New User',
            }),
          }),
        }),
      );

      const createdUser = await User.findOne({ email: 'newuser@example.com' });
      expect(createdUser).toBeTruthy();
    });

    it('should hash password before storing', async () => {
      const req = mockRequest({
        body: {
          email: 'hashtest@example.com',
          password: 'password123',
          fullName: 'Hash Test',
        },
      });
      const res = mockResponse();

      await register(req as Request, res as Response);

      const user = await User.findOne({ email: 'hashtest@example.com' }).select(
        '+password',
      );
      expect(user?.password).not.toBe('password123');
      const isMatch = await bcrypt.compare('password123', user!.password);
      expect(isMatch).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('should return 404 if user not found', async () => {
      const req = mockRequest({
        user: { userId: '507f1f77bcf86cd799439011', email: 'test@example.com' },
      });
      const res = mockResponse();

      await getCurrentUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 200 with user data', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await getCurrentUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            user: expect.objectContaining({
              id: user._id,
              email: user.email,
              fullName: user.fullName,
            }),
          }),
        }),
      );
    });
  });

  describe('updateProfileImage', () => {
    it('should return 400 if no file uploaded', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        user: { userId: user._id.toString(), email: user.email },
        file: undefined,
      });
      const res = mockResponse();

      await updateProfileImage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No file uploaded',
      });
    });

    it('should update profile image and return full URL', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        user: { userId: user._id.toString(), email: user.email },
        file: { filename: 'profile123.jpg' },
      });
      const res = mockResponse();

      await updateProfileImage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          profileImage: 'http://localhost:3000/images/profile123.jpg',
        },
      });

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.profileImage).toBe('/images/profile123.jpg');
    });
  });

  describe('updateCoverImage', () => {
    it('should return 400 if no file uploaded', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        user: { userId: user._id.toString(), email: user.email },
        file: undefined,
      });
      const res = mockResponse();

      await updateCoverImage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No file uploaded',
      });
    });

    it('should update cover image and return full URL', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        user: { userId: user._id.toString(), email: user.email },
        file: { filename: 'cover123.jpg' },
      });
      const res = mockResponse();

      await updateCoverImage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          coverImage: 'http://localhost:3000/images/cover123.jpg',
        },
      });

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.coverImage).toBe('/images/cover123.jpg');
    });
  });
});
