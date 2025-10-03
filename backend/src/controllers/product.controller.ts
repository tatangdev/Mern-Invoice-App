import { type Request, type Response } from 'express';
import { Types } from 'mongoose';
import logger from '../config/logger.js';
import Product from '../db/models/Product.js';

export async function getAllProducts(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    const products = await Product.find({ userId }).sort({ createdAt: -1 });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const productsWithImages = products.map((product) => ({
      ...product.toObject(),
      image: product.image ? `${baseUrl}${product.image}` : null,
    }));

    res.status(200).json({
      data: productsWithImages,
    });
  } catch (error) {
    logger.error('Get all products error', { error });
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getProductById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: 'Invalid product ID',
      });
      return;
    }

    const product = await Product.findOne({ _id: id, userId });

    if (!product) {
      res.status(404).json({
        message: 'Product not found',
      });
      return;
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(200).json({
      data: {
        ...product.toObject(),
        image: product.image ? `${baseUrl}${product.image}` : null,
      },
    });
  } catch (error) {
    logger.error('Get product by ID error', { error });
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function createProduct(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { name, desc, price } = req.body;
    const userId = req.user?.userId;

    if (!name || !desc || price === undefined) {
      res.status(400).json({
        message: 'Name, description, and price are required',
      });
      return;
    }

    const existingProduct = await Product.findOne({ userId, name });
    if (existingProduct) {
      res.status(409).json({
        message: 'A product with this name already exists',
      });
      return;
    }

    const product = await Product.create({
      name,
      desc,
      price,
      userId,
    });

    logger.info('Product created', { productId: product._id, userId });

    res.status(201).json({
      data: product,
    });
  } catch (error) {
    logger.error('Create product error', { error });

    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({
        message: 'A product with this name already exists',
      });
      return;
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function updateProduct(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const { name, desc, price } = req.body;
    const userId = req.user?.userId;

    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: 'Invalid product ID',
      });
      return;
    }

    if (name) {
      const existingProduct = await Product.findOne({
        userId,
        name,
        _id: { $ne: id },
      });
      if (existingProduct) {
        res.status(409).json({
          message: 'A product with this name already exists',
        });
        return;
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, userId },
      { name, desc, price },
      { new: true, runValidators: true },
    );

    if (!product) {
      res.status(404).json({
        message: 'Product not found',
      });
      return;
    }

    logger.info('Product updated', { productId: product._id, userId });

    res.status(200).json({
      data: product,
    });
  } catch (error) {
    logger.error('Update product error', { error });

    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({
        message: 'A product with this name already exists',
      });
      return;
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function updateProductImage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: 'Invalid product ID',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        message: 'No file uploaded',
      });
      return;
    }

    const userId = req.user?.userId;
    const imageUrl = `/images/${req.file.filename}`;

    const product = await Product.findOneAndUpdate(
      { _id: id, userId },
      { image: imageUrl },
      { new: true },
    );

    if (!product) {
      res.status(404).json({
        message: 'Product not found',
      });
      return;
    }

    logger.info('Product image updated', { productId: product._id, userId });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.status(200).json({
      data: {
        image: product.image ? `${baseUrl}${product.image}` : null,
      },
    });
  } catch (error) {
    logger.error('Update product image error', { error });
    res.status(500).json({
      message: 'Failed to update product image',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: 'Invalid product ID',
      });
      return;
    }

    const product = await Product.findOneAndDelete({ _id: id, userId });

    if (!product) {
      res.status(404).json({
        message: 'Product not found',
      });
      return;
    }

    logger.info('Product deleted', { productId: product._id, userId });

    res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    logger.error('Delete product error', { error });
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
