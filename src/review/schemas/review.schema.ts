import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, type: Number, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, type: String })
  comment: string;

  @Prop({ required: true, type: String })
  productId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId?: string;

  @Prop({ type: String })
  guestName?: string;

  @Prop({ type: String })
  ipAddress: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
