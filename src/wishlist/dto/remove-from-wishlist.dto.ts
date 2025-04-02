import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
export class RemoveFromWishlistDto {
  @IsMongoId()
  productId: Types.ObjectId;
}
