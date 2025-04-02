import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class User {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  profilePicture: string;

  @Prop({ required: false, default: false })
  emailConfirmed: boolean;

  @Prop({ required: false, default: 'user', enum: ['user', 'admin'] })
  role: 'user' | 'admin';

  @Prop()
  googleId: string;

  @Prop()
  facebookId: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Product' }] })
  wishlist: MongooseSchema.Types.ObjectId[];
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
