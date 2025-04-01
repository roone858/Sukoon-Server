import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart &
  Document & {
    updatedAt: Date;
  };

@Schema({
  timestamps: { createdAt: false, updatedAt: true },
  collection: 'carts',
})
export class Cart {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: [
      {
        productId: {
          type: Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        dimensionId: {
          // إضافة reference للبعد المحدد
          type: Types.ObjectId,
          required: false,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity cannot be less than 1'],
          max: [999, 'Quantity cannot exceed 999'],
        },
      },
    ],
    required: true,
    default: [],
  })
  items: {
    productId: Types.ObjectId;
    dimensionId?: Types.ObjectId;
    quantity: number;
  }[];

  @Prop({
    type: Date,
    default: Date.now,
    index: true,
  })
  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
