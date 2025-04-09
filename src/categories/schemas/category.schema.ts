import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  parentId?: string;

  @Prop([
    {
      _id: { type: MongooseSchema.Types.ObjectId },
      name: String,
      slug: String,
    },
  ])
  ancestors?: {
    _id: MongooseSchema.Types.ObjectId;
    name: string;
    slug: string;
  }[];

  @Prop({ default: 0 })
  level: number;

  @Prop()
  imageUrl?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop()
  metaTitle?: string;

  @Prop()
  metaDescription?: string;

  @Prop([String])
  attributes?: string[];

  @Prop([String])
  seoKeywords?: string[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
// Add any virtuals or methods
CategorySchema.methods.toJSON = function () {
  const obj = this.toObject();
  // Remove any sensitive data or transform the object here
  return obj;
};
