import { type Request, type Response, type NextFunction } from 'express';
import { validateToken } from '../utils/jwt.js';
import logger from '../config/logger.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
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

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    logger.error('Authentication error', { error });
    res.status(401).json({
      message: error instanceof Error ? error.message : 'Authentication failed',
    });
  }
}
