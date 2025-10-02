import { Router, type IRouter } from 'express';
import {
  login,
  register,
  getCurrentUser,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getCurrentUser);

export default router;
