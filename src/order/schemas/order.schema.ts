import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

// Define the type for OrderDocument
export type OrderDocument = Order &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

// Define the Item interface for better type safety
interface Item {
  productId: string;
  quantity: number;
  price: number;
  name: string; // Added product name for better order history
  subtotal: number; // Added subtotal for each item
}

// Define the Payment interface
interface Payment {
  method: 'cash' | 'card' | 'wallet';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  amount: number;
  paidAt?: Date;
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: User;

  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({
    type: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        name: { type: String, required: true },
        subtotal: { type: Number, required: true },
      },
    ],
    required: true,
    validate: {
      validator: function (items: Item[]) {
        return items.length > 0;
      },
      message: 'Order must contain at least one item',
    },
  })
  items: Item[];

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ required: true })
  customerPhone: string;

  @Prop({
    type: {
      address: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },
    required: false,
  })
  delivery?: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0 })
  tax: number;

  @Prop({ required: true, min: 0 })
  shippingCost: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({
    required: true,
    type: {
      method: {
        type: String,
        enum: ['cash', 'card', 'wallet'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        required: true,
      },
      transactionId: String,
      amount: { type: Number, required: true },
      paidAt: Date,
    },
  })
  payment: Payment;

  @Prop({
    required: true,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ],
    default: 'pending',
  })
  status: string;

  @Prop({ required: true, enum: ['delivery', 'pickup'] })
  pickupMethod: string;

  @Prop({ required: false })
  notes?: string;

  @Prop({ type: [{ status: String, timestamp: Date, note: String }] })
  statusHistory: Array<{ status: string; timestamp: Date; note: string }>;

  @Prop({ type: Boolean, default: false })
  isArchived: boolean;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop({ type: String })
  cancellationReason?: string;
}

// Create the Mongoose schema
export const OrderSchema = SchemaFactory.createForClass(Order);

// Add indexes for better query performance
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
