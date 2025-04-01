import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsString,
} from 'class-validator';

class CartItemDto {
  @IsNotEmpty()
  productId: string;

  @IsOptional()
  @IsString()
  dimensionId?: string; // معرف البعد (إن وجد)

  @IsNumber()
  @Min(1, { message: 'Quantity cannot be less than 1' })
  @Max(999, { message: 'Quantity cannot exceed 999' })
  quantity: number;
}

export class CreateCartDto {
  @IsOptional()
  userId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
