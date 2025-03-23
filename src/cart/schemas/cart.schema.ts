import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: { createdAt: false, updatedAt: true } }) // فقط `updatedAt`
export class Cart {
  @Prop({ required: true })
  userId: string; // ObjectId كـ string
  // ObjectId كـ string

  @Prop({
    type: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: false },
      },
    ],
    required: true,
  })
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
