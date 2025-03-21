import { IsNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @IsNotEmpty()
  items: OrderItemDto[];

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;
}
