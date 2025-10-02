import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  desc: string;
  price: number;
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for id
ProductSchema.virtual('id').get(function (this: any) {
  return this._id.toHexString();
});

// Remove _id and __v from JSON output
ProductSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<IProduct>('Product', ProductSchema);
