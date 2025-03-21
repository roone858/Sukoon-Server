import { IsNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';

class CartItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class CreateCartDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @IsNotEmpty()
  items: CartItemDto[];
}
