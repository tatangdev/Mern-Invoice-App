import { Router, type IRouter } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductImage,
  deleteProduct,
} from '../controllers/product.controller.js';
import { imageStorage } from '../utils/multer.js';

const router: IRouter = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.patch('/:id/image', imageStorage.single('image'), updateProductImage);
router.delete('/:id', deleteProduct);

export default router;
