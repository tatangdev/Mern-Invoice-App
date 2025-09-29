import { type Request, type Response } from 'express';
import { generateToken, validateToken } from '../utils/jwt.js';
import logger from '../config/logger.js';

const mockUsers = [
  {
    id: '1',
    email: 'user@example.com',
    password: 'password123',
    name: 'Test User',
  },
];

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: 'Email and password are required',
      });
      return;
    }

    const user = mockUsers.find((u) => u.email === email);

    if (!user || user.password !== password) {
      res.status(401).json({
        message: 'Invalid credentials',
      });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    logger.info('User logged in', { userId: user.id, email: user.email });

    res.status(200).json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    logger.error('Login error', { error });
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        message: 'Email, password, and name are required',
      });
      return;
    }

    const existingUser = mockUsers.find((u) => u.email === email);

    if (existingUser) {
      res.status(409).json({
        message: 'User already exists',
      });
      return;
    }

    const newUser = {
      id: String(mockUsers.length + 1),
      email,
      password,
      name,
    };

    mockUsers.push(newUser);

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
    });

    logger.info('User registered', {
      userId: newUser.id,
      email: newUser.email,
    });

    res.status(201).json({
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      },
    });
  } catch (error) {
    logger.error('Register error', { error });
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getCurrentUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = validateToken(token);
    const user = mockUsers.find((u) => u.id === decoded.userId);

    if (!user) {
      res.status(404).json({
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    logger.error('Get current user error', { error });
    res.status(401).json({
      message: error instanceof Error ? error.message : 'Authentication failed',
    });
  }
}
