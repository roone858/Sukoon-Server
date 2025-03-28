// product.dto.ts
import { Expose, Transform, Type } from 'class-transformer';
class ProductImageDto {
  @Expose()
  public_id?: string;

  @Expose()
  url?: string;

  @Expose()
  altText?: string;
}
export class ProductResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  stock: number;
  @Expose()
  discount: number;

  @Expose()
  discountEndDate?: Date;

  @Transform(({ obj }) => obj.price * (1 - (obj.discount || 0) / 100))
  @Expose()
  finalPrice: number;

  @Expose()
  categories: string[];

  @Expose()
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @Expose()
  tags: string[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
