import { Router, type IRouter } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import invoiceRoutes from './invoice.routes.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router: IRouter = Router();

router.use('/auth', authRoutes);
router.use('/products', authenticate, productRoutes);
router.use('/invoices', authenticate, invoiceRoutes);

export default router;
