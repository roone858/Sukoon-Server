import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class AddToWishlistDto {
  @IsMongoId()
  productId: Types.ObjectId;
}
