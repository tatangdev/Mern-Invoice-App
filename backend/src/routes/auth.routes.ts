import { Router, type IRouter } from 'express';
import {
  login,
  register,
  getCurrentUser,
} from '../controllers/auth.controller.js';

const router: IRouter = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', getCurrentUser);

export default router;
