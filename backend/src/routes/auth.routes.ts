import { Router, type IRouter } from 'express';
import {
  login,
  register,
  getCurrentUser,
  updateProfileImage,
  updateCoverImage,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { imageStorage } from '../utils/multer.js';

const router: IRouter = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getCurrentUser);
router.patch(
  '/profile-image',
  authenticate,
  imageStorage.single('profileImage'),
  updateProfileImage,
);
router.patch(
  '/cover-image',
  authenticate,
  imageStorage.single('coverImage'),
  updateCoverImage,
);

export default router;
