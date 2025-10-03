import { type Request, type Response } from 'express';
import { describe, it, expect } from 'vitest';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductImage,
  deleteProduct,
} from './product.controller.js';
import Product from '../db/models/Product.js';
import {
  createTestUser,
  mockRequest,
  mockResponse,
} from '../../tests/helpers/testHelpers.js';

describe('Product Controller', () => {
  describe('getAllProducts', () => {
    it('should return empty array if no products exist', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await getAllProducts(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [] });
    });

    it('should return only products for authenticated user', async () => {
      const { user: user1 } = await createTestUser({
        email: 'user1@example.com',
      });
      const { user: user2 } = await createTestUser({
        email: 'user2@example.com',
      });

      await Product.create({
        name: 'Product 1',
        desc: 'Description 1',
        price: 100,
        userId: user1._id,
      });
      await Product.create({
        name: 'Product 2',
        desc: 'Description 2',
        price: 200,
        userId: user2._id,
      });

      const req = mockRequest({
        user: { userId: user1._id.toString(), email: user1.email },
      });
      const res = mockResponse();

      await getAllProducts(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data).toHaveLength(1);
      expect(response.data[0].name).toBe('Product 1');
    });

    it('should return products with full image URLs', async () => {
      const { user } = await createTestUser();
      await Product.create({
        name: 'Product with Image',
        desc: 'Description',
        price: 100,
        userId: user._id,
        image: '/images/test.jpg',
      });

      const req = mockRequest({
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await getAllProducts(req as Request, res as Response);

      const response = res.json.mock.calls[0][0];
      expect(response.data[0].image).toBe(
        'http://localhost:3000/images/test.jpg',
      );
    });
  });

  describe('getProductById', () => {
    it('should return 400 if product ID is invalid', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        params: { id: 'invalid-id' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await getProductById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid product ID',
      });
    });

    it('should return 404 if product not found', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        params: { id: '507f1f77bcf86cd799439011' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await getProductById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Product not found',
      });
    });

    it('should return 404 if product belongs to different user', async () => {
      const { user: user1 } = await createTestUser({
        email: 'user1@example.com',
      });
      const { user: user2 } = await createTestUser({
        email: 'user2@example.com',
      });

      const product = await Product.create({
        name: 'Product 1',
        desc: 'Description',
        price: 100,
        userId: user1._id,
      });

      const req = mockRequest({
        params: { id: product._id.toString() },
        user: { userId: user2._id.toString(), email: user2.email },
      });
      const res = mockResponse();

      await getProductById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Product not found',
      });
    });

    it('should return product with full image URL', async () => {
      const { user } = await createTestUser();
      const product = await Product.create({
        name: 'Test Product',
        desc: 'Description',
        price: 100,
        userId: user._id,
        image: '/images/product.jpg',
      });

      const req = mockRequest({
        params: { id: product._id.toString() },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await getProductById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.image).toBe(
        'http://localhost:3000/images/product.jpg',
      );
    });
  });

  describe('createProduct', () => {
    it('should return 400 if required fields are missing', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        body: { name: 'Product' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await createProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Name, description, and price are required',
      });
    });

    it('should return 409 if product name already exists for user', async () => {
      const { user } = await createTestUser();
      await Product.create({
        name: 'Duplicate Product',
        desc: 'Description',
        price: 100,
        userId: user._id,
      });

      const req = mockRequest({
        body: {
          name: 'Duplicate Product',
          desc: 'Another description',
          price: 200,
        },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await createProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'A product with this name already exists',
      });
    });

    it('should allow same product name for different users', async () => {
      const { user: user1 } = await createTestUser({
        email: 'user1@example.com',
      });
      const { user: user2 } = await createTestUser({
        email: 'user2@example.com',
      });

      await Product.create({
        name: 'Kopi',
        desc: 'Description 1',
        price: 100,
        userId: user1._id,
      });

      const req = mockRequest({
        body: {
          name: 'Kopi',
          desc: 'Description 2',
          price: 150,
        },
        user: { userId: user2._id.toString(), email: user2.email },
      });
      const res = mockResponse();

      await createProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      const products = await Product.find({ name: 'Kopi' });
      expect(products).toHaveLength(2);
    });

    it('should create product successfully', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        body: {
          name: 'New Product',
          desc: 'New Description',
          price: 500,
        },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await createProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      const product = await Product.findOne({ name: 'New Product' });
      expect(product).toBeTruthy();
      expect(product?.userId.toString()).toBe(user._id.toString());
    });
  });

  describe('updateProduct', () => {
    it('should return 400 if product ID is invalid', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        params: { id: 'invalid-id' },
        body: { name: 'Updated' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await updateProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid product ID',
      });
    });

    it('should return 409 if new name already exists for user', async () => {
      const { user } = await createTestUser();
      await Product.create({
        name: 'Existing Product',
        desc: 'Description',
        price: 100,
        userId: user._id,
      });
      const product = await Product.create({
        name: 'Product to Update',
        desc: 'Description',
        price: 200,
        userId: user._id,
      });

      const req = mockRequest({
        params: { id: product._id.toString() },
        body: { name: 'Existing Product' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await updateProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'A product with this name already exists',
      });
    });

    it('should update product successfully', async () => {
      const { user } = await createTestUser();
      const product = await Product.create({
        name: 'Old Name',
        desc: 'Old Description',
        price: 100,
        userId: user._id,
      });

      const req = mockRequest({
        params: { id: product._id.toString() },
        body: { name: 'New Name', price: 150 },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await updateProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct?.name).toBe('New Name');
      expect(updatedProduct?.price).toBe(150);
    });

    it('should return 404 if product belongs to different user', async () => {
      const { user: user1 } = await createTestUser({
        email: 'user1@example.com',
      });
      const { user: user2 } = await createTestUser({
        email: 'user2@example.com',
      });

      const product = await Product.create({
        name: 'Product 1',
        desc: 'Description',
        price: 100,
        userId: user1._id,
      });

      const req = mockRequest({
        params: { id: product._id.toString() },
        body: { name: 'Updated Name' },
        user: { userId: user2._id.toString(), email: user2.email },
      });
      const res = mockResponse();

      await updateProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateProductImage', () => {
    it('should return 400 if no file uploaded', async () => {
      const { user } = await createTestUser();
      const product = await Product.create({
        name: 'Product',
        desc: 'Description',
        price: 100,
        userId: user._id,
      });

      const req = mockRequest({
        params: { id: product._id.toString() },
        user: { userId: user._id.toString(), email: user.email },
        file: undefined,
      });
      const res = mockResponse();

      await updateProductImage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No file uploaded',
      });
    });

    it('should update product image and return full URL', async () => {
      const { user } = await createTestUser();
      const product = await Product.create({
        name: 'Product',
        desc: 'Description',
        price: 100,
        userId: user._id,
      });

      const req = mockRequest({
        params: { id: product._id.toString() },
        user: { userId: user._id.toString(), email: user.email },
        file: { filename: 'product123.jpg' },
      });
      const res = mockResponse();

      await updateProductImage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          image: 'http://localhost:3000/images/product123.jpg',
        },
      });

      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct?.image).toBe('/images/product123.jpg');
    });
  });

  describe('deleteProduct', () => {
    it('should return 400 if product ID is invalid', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        params: { id: 'invalid-id' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await deleteProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid product ID',
      });
    });

    it('should return 404 if product not found', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        params: { id: '507f1f77bcf86cd799439011' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await deleteProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Product not found',
      });
    });

    it('should delete product successfully', async () => {
      const { user } = await createTestUser();
      const product = await Product.create({
        name: 'Product to Delete',
        desc: 'Description',
        price: 100,
        userId: user._id,
      });

      const req = mockRequest({
        params: { id: product._id.toString() },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await deleteProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Product deleted successfully',
      });

      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    it('should return 404 if product belongs to different user', async () => {
      const { user: user1 } = await createTestUser({
        email: 'user1@example.com',
      });
      const { user: user2 } = await createTestUser({
        email: 'user2@example.com',
      });

      const product = await Product.create({
        name: 'Product 1',
        desc: 'Description',
        price: 100,
        userId: user1._id,
      });

      const req = mockRequest({
        params: { id: product._id.toString() },
        user: { userId: user2._id.toString(), email: user2.email },
      });
      const res = mockResponse();

      await deleteProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      const stillExists = await Product.findById(product._id);
      expect(stillExists).toBeTruthy();
    });
  });
});
