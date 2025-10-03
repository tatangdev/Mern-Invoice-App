import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  desc: string;
  price: number;
  image?: string;
  userId: mongoose.Types.ObjectId;
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxLength: [200, 'Product name cannot exceed 200 characters'],
      index: true,
    },
    desc: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ProductSchema.index({ userId: 1, name: 1 }, { unique: true });

ProductSchema.virtual('id').get(function (this: any) {
  return this._id.toHexString();
});

ProductSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<IProduct>('Product', ProductSchema);
