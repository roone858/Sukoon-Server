import {
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';

class UpdateCartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;
}

export class UpdateCartDto {
  @IsArray()
  @IsNotEmpty()
  items: UpdateCartItemDto[];
}
