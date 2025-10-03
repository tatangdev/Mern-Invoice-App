import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  productDesc: string;
  price: number;
  qty: number;
  total: number;
}

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  recipient: string;
  number: string;
  items: IInvoiceItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  issueDate?: Date;
  dueDate?: Date;
  notes?: string;
}

const InvoiceItemSchema: Schema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    productDesc: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    qty: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
  },
  { _id: false },
);

const InvoiceSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    recipient: {
      type: String,
      required: [true, 'Recipient is required'],
      trim: true,
      maxLength: [200, 'Recipient name cannot exceed 200 characters'],
    },
    number: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    items: {
      type: [InvoiceItemSchema],
      required: [true, 'At least one item is required'],
      validate: {
        validator: (items: IInvoiceItem[]) => items.length > 0,
        message: 'Invoice must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'cancelled'],
      default: 'draft',
      index: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxLength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  },
);

InvoiceSchema.index({ userId: 1, createdAt: -1 });
InvoiceSchema.index({ userId: 1, status: 1 });

InvoiceSchema.virtual('id').get(function (this: any) {
  return this._id.toHexString();
});

InvoiceSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
