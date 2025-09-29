import { Router, type IRouter } from 'express';
import authRoutes from './auth.routes.js';

const router: IRouter = Router();

router.use('/auth', authRoutes);

export default router;
