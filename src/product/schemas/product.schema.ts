import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({
    required: true,
    type: Number,
    set: (v: any) => parseFloat(v) || 0,
  })
  price: number;

  @Prop({
    required: true,
    type: Number,
    set: (v: any) => parseInt(v) || 0,
  })
  stock: number;

  @Prop({
    required: false,
    type: Number,
    min: 0,
    max: 100,
    set: (v: any) => parseFloat(v),
  })
  discount: number;

  @Prop({
    type: Date,
    required: false,
  })
  discountEndDate?: Date;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ type: [String], required: true })
  categories: string[];

  @Prop({
    type: [
      {
        size: {
          width: { type: Number, required: true },
          height: { type: Number, required: true },
          label: { type: String, required: true },
        },
        price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    _id: true,
  })
  dimensions?: {
    size: {
      width: number;
      height: number;
      label: string;
    };
    price: number;
    stock?: number;
    isAvailable?: boolean;
  }[];

  @Prop([
    {
      public_id: String,
      url: String,
      altText: String,
    },
  ])
  images?: Array<{
    public_id?: string;
    url?: string;
    altText?: string;
  }>;

  // Virtual for final price after discount
  public get finalPrice(): number {
    return this.price * (1 - this.discount / 100);
  }
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.virtual('finalPrice').get(function () {
  return this.price * (1 - this.discount / 100);
});

export type ProductDocument = Product &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };
