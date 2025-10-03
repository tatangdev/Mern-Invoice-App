import { type Request, type Response } from 'express';
import { describe, it, expect } from 'vitest';
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from './invoice.controller.js';
import Invoice from '../db/models/Invoice.js';
import Product from '../db/models/Product.js';
import {
  createTestUser,
  mockRequest,
  mockResponse,
} from '../../tests/helpers/testHelpers.js';

describe('Invoice Controller', () => {
  describe('getAllInvoices', () => {
    it('should return 401 if userId is missing', async () => {
      const req = mockRequest({ user: undefined });
      const res = mockResponse();

      await getAllInvoices(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('should return empty array if no invoices exist', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await getAllInvoices(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: [] });
    });

    it('should return only invoices for authenticated user', async () => {
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

      await Invoice.create({
        userId: user1._id,
        recipient: 'Client 1',
        number: 'INV-001',
        items: [
          {
            product: product._id,
            productName: product.name,
            productDesc: product.desc,
            price: product.price,
            qty: 2,
            total: 200,
          },
        ],
        subtotal: 200,
        total: 200,
      });

      await Invoice.create({
        userId: user2._id,
        recipient: 'Client 2',
        number: 'INV-002',
        items: [
          {
            product: product._id,
            productName: product.name,
            productDesc: product.desc,
            price: product.price,
            qty: 1,
            total: 100,
          },
        ],
        subtotal: 100,
        total: 100,
      });

      const req = mockRequest({
        user: { userId: user1._id.toString(), email: user1.email },
      });
      const res = mockResponse();

      await getAllInvoices(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data).toHaveLength(1);
      expect(response.data[0].number).toBe('INV-001');
    });
  });

  describe('getInvoiceById', () => {
    it('should return 401 if userId is missing', async () => {
      const req = mockRequest({
        params: { id: '507f1f77bcf86cd799439011' },
        user: undefined,
      });
      const res = mockResponse();

      await getInvoiceById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('should return 400 if invoice ID is invalid', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        params: { id: 'invalid-id' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await getInvoiceById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid invoice ID',
      });
    });

    it('should return 404 if invoice not found', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        params: { id: '507f1f77bcf86cd799439011' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await getInvoiceById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invoice not found',
      });
    });

    it('should return invoice data', async () => {
      const { user } = await createTestUser();
      const product = await Product.create({
        name: 'Test Product',
        desc: 'Description',
        price: 100,
        userId: user._id,
      });

      const invoice = await Invoice.create({
        userId: user._id,
        recipient: 'Test Client',
        number: 'INV-TEST-001',
        items: [
          {
            product: product._id,
            productName: product.name,
            productDesc: product.desc,
            price: product.price,
            qty: 3,
            total: 300,
          },
        ],
        subtotal: 300,
        total: 300,
      });

      const req = mockRequest({
        params: { id: invoice._id.toString() },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await getInvoiceById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.number).toBe('INV-TEST-001');
      expect(response.data.recipient).toBe('Test Client');
    });

    it('should return 404 if invoice belongs to different user', async () => {
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

      const invoice = await Invoice.create({
        userId: user1._id,
        recipient: 'Client 1',
        number: 'INV-USER1',
        items: [
          {
            product: product._id,
            productName: product.name,
            productDesc: product.desc,
            price: product.price,
            qty: 1,
            total: 100,
          },
        ],
        subtotal: 100,
        total: 100,
      });

      const req = mockRequest({
        params: { id: invoice._id.toString() },
        user: { userId: user2._id.toString(), email: user2.email },
      });
      const res = mockResponse();

      await getInvoiceById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invoice not found',
      });
    });
  });

  describe('createInvoice', () => {
    it('should return 401 if userId is missing', async () => {
      const req = mockRequest({
        body: { recipient: 'Client', number: 'INV-001' },
        user: undefined,
      });
      const res = mockResponse();

      await createInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        body: { recipient: 'Client' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await createInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message:
          'Recipient, invoice number, and at least one item are required',
      });
    });

    it('should return 400 if items array is empty', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        body: {
          recipient: 'Client',
          number: 'INV-001',
          items: [],
        },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await createInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message:
          'Recipient, invoice number, and at least one item are required',
      });
    });

    it('should return 400 if item missing productId or qty', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        body: {
          recipient: 'Client',
          number: 'INV-001',
          items: [{ productId: '507f1f77bcf86cd799439011' }],
        },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await createInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Each item must have productId and qty',
      });
    });

    it('should return 404 if product not found', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        body: {
          recipient: 'Client',
          number: 'INV-001',
          items: [{ productId: '507f1f77bcf86cd799439011', qty: 2 }],
        },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await createInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Product 507f1f77bcf86cd799439011 not found',
      });
    });

    it('should create invoice successfully with calculations', async () => {
      const { user } = await createTestUser();
      const product1 = await Product.create({
        name: 'Product 1',
        desc: 'Desc 1',
        price: 100,
        userId: user._id,
      });
      const product2 = await Product.create({
        name: 'Product 2',
        desc: 'Desc 2',
        price: 50,
        userId: user._id,
      });

      const req = mockRequest({
        body: {
          recipient: 'Test Client',
          number: 'INV-CREATE-001',
          items: [
            { productId: product1._id.toString(), qty: 2 },
            { productId: product2._id.toString(), qty: 3 },
          ],
          tax: 25,
          discount: 10,
          status: 'draft',
        },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await createInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      const response = res.json.mock.calls[0][0];
      expect(response.data.subtotal).toBe(350);
      expect(response.data.tax).toBe(25);
      expect(response.data.discount).toBe(10);
      expect(response.data.total).toBe(365);
      expect(response.data.items).toHaveLength(2);
    });

    it('should return 409 if invoice number already exists', async () => {
      const { user } = await createTestUser();
      const product = await Product.create({
        name: 'Product',
        desc: 'Desc',
        price: 100,
        userId: user._id,
      });

      await Invoice.create({
        userId: user._id,
        recipient: 'Client 1',
        number: 'INV-DUPLICATE',
        items: [
          {
            product: product._id,
            productName: product.name,
            productDesc: product.desc,
            price: product.price,
            qty: 1,
            total: 100,
          },
        ],
        subtotal: 100,
        total: 100,
      });

      const req = mockRequest({
        body: {
          recipient: 'Client 2',
          number: 'INV-DUPLICATE',
          items: [{ productId: product._id.toString(), qty: 1 }],
        },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await createInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invoice number already exists',
      });
    });
  });

  describe('updateInvoice', () => {
    it('should return 401 if userId is missing', async () => {
      const req = mockRequest({
        params: { id: '507f1f77bcf86cd799439011' },
        body: { status: 'sent' },
        user: undefined,
      });
      const res = mockResponse();

      await updateInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('should return 400 if invoice ID is invalid', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        params: { id: 'invalid-id' },
        body: { status: 'sent' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await updateInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid invoice ID',
      });
    });

    it('should update invoice status', async () => {
      const { user } = await createTestUser();
      const product = await Product.create({
        name: 'Product',
        desc: 'Desc',
        price: 100,
        userId: user._id,
      });

      const invoice = await Invoice.create({
        userId: user._id,
        recipient: 'Client',
        number: 'INV-UPDATE-001',
        items: [
          {
            product: product._id,
            productName: product.name,
            productDesc: product.desc,
            price: product.price,
            qty: 1,
            total: 100,
          },
        ],
        subtotal: 100,
        total: 100,
        status: 'draft',
      });

      const req = mockRequest({
        params: { id: invoice._id.toString() },
        body: { status: 'sent' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await updateInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      const updatedInvoice = await Invoice.findById(invoice._id);
      expect(updatedInvoice?.status).toBe('sent');
    });

    it('should update invoice items and recalculate totals', async () => {
      const { user } = await createTestUser();
      const product1 = await Product.create({
        name: 'Product 1',
        desc: 'Desc 1',
        price: 100,
        userId: user._id,
      });
      const product2 = await Product.create({
        name: 'Product 2',
        desc: 'Desc 2',
        price: 200,
        userId: user._id,
      });

      const invoice = await Invoice.create({
        userId: user._id,
        recipient: 'Client',
        number: 'INV-UPDATE-002',
        items: [
          {
            product: product1._id,
            productName: product1.name,
            productDesc: product1.desc,
            price: product1.price,
            qty: 1,
            total: 100,
          },
        ],
        subtotal: 100,
        total: 100,
      });

      const req = mockRequest({
        params: { id: invoice._id.toString() },
        body: {
          items: [{ productId: product2._id.toString(), qty: 2 }],
          tax: 20,
          discount: 5,
        },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await updateInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.data.subtotal).toBe(400);
      expect(response.data.tax).toBe(20);
      expect(response.data.discount).toBe(5);
      expect(response.data.total).toBe(415);
    });

    it('should return 404 if invoice not found', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        params: { id: '507f1f77bcf86cd799439011' },
        body: { status: 'sent' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await updateInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invoice not found',
      });
    });
  });

  describe('deleteInvoice', () => {
    it('should return 401 if userId is missing', async () => {
      const req = mockRequest({
        params: { id: '507f1f77bcf86cd799439011' },
        user: undefined,
      });
      const res = mockResponse();

      await deleteInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('should return 400 if invoice ID is invalid', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        params: { id: 'invalid-id' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await deleteInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid invoice ID',
      });
    });

    it('should return 404 if invoice not found', async () => {
      const { user } = await createTestUser();
      const req = mockRequest({
        params: { id: '507f1f77bcf86cd799439011' },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await deleteInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invoice not found',
      });
    });

    it('should delete invoice successfully', async () => {
      const { user } = await createTestUser();
      const product = await Product.create({
        name: 'Product',
        desc: 'Desc',
        price: 100,
        userId: user._id,
      });

      const invoice = await Invoice.create({
        userId: user._id,
        recipient: 'Client',
        number: 'INV-DELETE-001',
        items: [
          {
            product: product._id,
            productName: product.name,
            productDesc: product.desc,
            price: product.price,
            qty: 1,
            total: 100,
          },
        ],
        subtotal: 100,
        total: 100,
      });

      const req = mockRequest({
        params: { id: invoice._id.toString() },
        user: { userId: user._id.toString(), email: user.email },
      });
      const res = mockResponse();

      await deleteInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invoice deleted successfully',
      });

      const deletedInvoice = await Invoice.findById(invoice._id);
      expect(deletedInvoice).toBeNull();
    });

    it('should return 404 if invoice belongs to different user', async () => {
      const { user: user1 } = await createTestUser({
        email: 'user1@example.com',
      });
      const { user: user2 } = await createTestUser({
        email: 'user2@example.com',
      });

      const product = await Product.create({
        name: 'Product',
        desc: 'Desc',
        price: 100,
        userId: user1._id,
      });

      const invoice = await Invoice.create({
        userId: user1._id,
        recipient: 'Client',
        number: 'INV-DELETE-002',
        items: [
          {
            product: product._id,
            productName: product.name,
            productDesc: product.desc,
            price: product.price,
            qty: 1,
            total: 100,
          },
        ],
        subtotal: 100,
        total: 100,
      });

      const req = mockRequest({
        params: { id: invoice._id.toString() },
        user: { userId: user2._id.toString(), email: user2.email },
      });
      const res = mockResponse();

      await deleteInvoice(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      const stillExists = await Invoice.findById(invoice._id);
      expect(stillExists).toBeTruthy();
    });
  });
});
