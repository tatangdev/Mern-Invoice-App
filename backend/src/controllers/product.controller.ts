import { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import logger from '../config/logger.js';
import Product from '../db/models/Product.js';

export async function getAllProducts(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      data: products,
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
    console.log({ id });

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: 'Invalid product ID',
      });
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      data: product,
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

    if (!name || !desc || price === undefined) {
      res.status(400).json({
        message: 'Name, description, and price are required',
      });
      return;
    }

    const product = await Product.create({
      name,
      desc,
      price,
    });

    logger.info('Product created', { productId: product._id });

    res.status(201).json({
      data: product,
    });
  } catch (error) {
    logger.error('Create product error', { error });
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

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: 'Invalid product ID',
      });
      return;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { name, desc, price },
      { new: true, runValidators: true },
    );

    if (!product) {
      res.status(404).json({
        message: 'Product not found',
      });
      return;
    }

    logger.info('Product updated', { productId: product._id });

    res.status(200).json({
      data: product,
    });
  } catch (error) {
    logger.error('Update product error', { error });
    res.status(500).json({
      message: 'Internal server error',
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

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: 'Invalid product ID',
      });
      return;
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({
        message: 'Product not found',
      });
      return;
    }

    logger.info('Product deleted', { productId: product._id });

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
