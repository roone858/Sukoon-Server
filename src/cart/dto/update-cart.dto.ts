import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsMongoId,
  IsString,
} from 'class-validator';

class UpdateCartItemDto {
  @IsOptional()
  @IsMongoId()
  productId?: string;

  @IsOptional()
  @IsString()
  dimensionId?: string; // معرف البعد (إن وجد)

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Quantity cannot be less than 1' })
  @Max(999, { message: 'Quantity cannot exceed 999' })
  quantity?: number;
}

export class UpdateCartDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCartItemDto)
  items?: UpdateCartItemDto[];
}
