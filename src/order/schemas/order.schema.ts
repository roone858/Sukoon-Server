import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  userId: string; // ObjectId as string

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
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 'Pending' })
  status: string; // Pending, Shipped, Delivered, etc.

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
