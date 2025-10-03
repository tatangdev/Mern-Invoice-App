import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { generateToken } from '../utils/jwt.js';
import logger from '../config/logger.js';
import User from '../db/models/User.js';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: 'Email and password are required',
      });
      return;
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        message: 'Invalid credentials',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        message: 'Invalid credentials',
      });
      return;
    }

    const token = generateToken({
      userId: (user._id as mongoose.Types.ObjectId).toString(),
      email: user.email,
    });

    logger.info('User logged in', { userId: user._id, email: user.email });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(200).json({
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          profileImage: user.profileImage
            ? `${baseUrl}${user.profileImage}`
            : null,
          coverImage: user.coverImage ? `${baseUrl}${user.coverImage}` : null,
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
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({
        message: 'Email, password, and full name are required',
      });
      return;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({
        message: 'User already exists',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      fullName,
    });

    const token = generateToken({
      userId: (newUser._id as mongoose.Types.ObjectId).toString(),
      email: newUser.email,
    });

    logger.info('User registered', {
      userId: newUser._id,
      email: newUser.email,
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(201).json({
      data: {
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          fullName: newUser.fullName,
          profileImage: newUser.profileImage
            ? `${baseUrl}${newUser.profileImage}`
            : null,
          coverImage: newUser.coverImage
            ? `${baseUrl}${newUser.coverImage}`
            : null,
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
    const user = await User.findById(req.user?.userId);

    if (!user) {
      res.status(404).json({
        message: 'User not found',
      });
      return;
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(200).json({
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          profileImage: user.profileImage
            ? `${baseUrl}${user.profileImage}`
            : null,
          coverImage: user.coverImage ? `${baseUrl}${user.coverImage}` : null,
        },
      },
    });
  } catch (error) {
    logger.error('Get current user error', { error });
    res.status(500).json({
      message: 'Failed to get current user',
    });
  }
}

export async function updateProfileImage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!req.file) {
      res.status(400).json({
        message: 'No file uploaded',
      });
      return;
    }

    const imageUrl = `/images/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true },
    );

    if (!user) {
      res.status(404).json({
        message: 'User not found',
      });
      return;
    }

    logger.info('Profile image updated', { userId });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(200).json({
      data: {
        profileImage: user.profileImage
          ? `${baseUrl}${user.profileImage}`
          : null,
      },
    });
  } catch (error) {
    logger.error('Update profile image error', { error });
    res.status(500).json({
      message: 'Failed to update profile image',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function updateCoverImage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!req.file) {
      res.status(400).json({
        message: 'No file uploaded',
      });
      return;
    }

    const imageUrl = `/images/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { coverImage: imageUrl },
      { new: true },
    );

    if (!user) {
      res.status(404).json({
        message: 'User not found',
      });
      return;
    }

    logger.info('Cover image updated', { userId });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(200).json({
      data: {
        coverImage: user.coverImage ? `${baseUrl}${user.coverImage}` : null,
      },
    });
  } catch (error) {
    logger.error('Update cover image error', { error });
    res.status(500).json({
      message: 'Failed to update cover image',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
