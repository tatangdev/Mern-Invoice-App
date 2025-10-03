import { type Request, type Response } from 'express';
import { Types } from 'mongoose';
import logger from '../config/logger.js';
import Invoice from '../db/models/Invoice.js';
import Product from '../db/models/Product.js';

export async function getAllInvoices(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      data: invoices,
    });
  } catch (error) {
    logger.error('Get all invoices error', { error });
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function getInvoiceById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: 'Invalid invoice ID',
      });
      return;
    }

    const invoice = await Invoice.findOne({ _id: id, userId });

    if (!invoice) {
      res.status(404).json({
        message: 'Invoice not found',
      });
      return;
    }

    res.status(200).json({
      data: invoice,
    });
  } catch (error) {
    logger.error('Get invoice by ID error', { error });
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function createInvoice(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    const {
      recipient,
      number,
      items,
      tax,
      discount,
      status,
      issueDate,
      dueDate,
      notes,
    } = req.body;

    if (
      !recipient ||
      !number ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      res.status(400).json({
        message:
          'Recipient, invoice number, and at least one item are required',
      });
      return;
    }

    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item.productId || !item.qty) {
        res.status(400).json({
          message: 'Each item must have productId and qty',
        });
        return;
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        res.status(404).json({
          message: `Product ${item.productId} not found`,
        });
        return;
      }

      const itemTotal = product.price * item.qty;
      subtotal += itemTotal;

      processedItems.push({
        product: product._id,
        productName: product.name,
        productDesc: product.desc,
        price: product.price,
        qty: item.qty,
        total: itemTotal,
      });
    }

    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const total = subtotal + taxAmount - discountAmount;

    const invoice = await Invoice.create({
      userId,
      recipient,
      number,
      items: processedItems,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      total,
      status: status || 'draft',
      issueDate: issueDate || Date.now(),
      dueDate,
      notes,
    });

    logger.info('Invoice created', { invoiceId: invoice._id, userId });

    res.status(201).json({
      data: invoice,
    });
  } catch (error) {
    logger.error('Create invoice error', { error });

    if ((error as any).code === 11000) {
      res.status(409).json({
        message: 'Invoice number already exists',
      });
      return;
    }

    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function updateInvoice(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: 'Invalid invoice ID',
      });
      return;
    }

    const {
      recipient,
      number,
      items,
      tax,
      discount,
      status,
      issueDate,
      dueDate,
      notes,
    } = req.body;

    const updateData: any = {};

    if (recipient) updateData.recipient = recipient;
    if (number) updateData.number = number;
    if (status) updateData.status = status;
    if (issueDate) updateData.issueDate = issueDate;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (notes !== undefined) updateData.notes = notes;

    if (items && Array.isArray(items) && items.length > 0) {
      const processedItems = [];
      let subtotal = 0;

      for (const item of items) {
        if (!item.productId || !item.qty) {
          res.status(400).json({
            message: 'Each item must have productId and qty',
          });
          return;
        }

        const product = await Product.findById(item.productId);

        if (!product) {
          res.status(404).json({
            message: `Product ${item.productId} not found`,
          });
          return;
        }

        const itemTotal = product.price * item.qty;
        subtotal += itemTotal;

        processedItems.push({
          product: product._id,
          productName: product.name,
          productDesc: product.desc,
          price: product.price,
          qty: item.qty,
          total: itemTotal,
        });
      }

      const taxAmount = tax !== undefined ? tax : 0;
      const discountAmount = discount !== undefined ? discount : 0;
      const total = subtotal + taxAmount - discountAmount;

      updateData.items = processedItems;
      updateData.subtotal = subtotal;
      updateData.tax = taxAmount;
      updateData.discount = discountAmount;
      updateData.total = total;
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true },
    );

    if (!invoice) {
      res.status(404).json({
        message: 'Invoice not found',
      });
      return;
    }

    logger.info('Invoice updated', { invoiceId: invoice._id, userId });

    res.status(200).json({
      data: invoice,
    });
  } catch (error) {
    logger.error('Update invoice error', { error });

    if ((error as any).code === 11000) {
      res.status(409).json({
        message: 'Invoice number already exists',
      });
      return;
    }

    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function deleteInvoice(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: 'Invalid invoice ID',
      });
      return;
    }

    const invoice = await Invoice.findOneAndDelete({ _id: id, userId });

    if (!invoice) {
      res.status(404).json({
        message: 'Invoice not found',
      });
      return;
    }

    logger.info('Invoice deleted', { invoiceId: invoice._id, userId });

    res.status(200).json({
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    logger.error('Delete invoice error', { error });
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
