import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Define the type for OrderDocument
export type OrderDocument = Order & Document;

// Define the Item interface for better type safety
interface Item {
  productId: string;
  quantity: number;
  price: number;
}

@Schema({ timestamps: true }) // Enable automatic createdAt and updatedAt fields
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId; // Use ObjectId instead of string for better referencing

  @Prop({
    type: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    required: true,
  })
  items: Item[]; // Use the Item interface for type safety

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  deliveryAddress: string;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 'delivery', enum: ['delivery', 'pickup'] }) // Restrict values to 'delivery' or 'pickup'
  pickupMethod: string;

  @Prop({ required: false })
  notes?: string;

  // createdAt is automatically added by { timestamps: true }
}

// Create the Mongoose schema
export const OrderSchema = SchemaFactory.createForClass(Order);
