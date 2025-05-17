import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsIn,
  IsEmail,
  IsPhoneNumber,
  Min,
  ValidateIf,
} from 'class-validator';

// Define the DTO for items in the order
class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsOptional()
  dimensionId?: string; // Optional for products with dimensions

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  subtotal: number;
}

// Define the DTO for delivery information
class DeliveryDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;
}

// Define the DTO for payment information
class PaymentDto {
  @IsString()
  @IsIn(['cash', 'card', 'wallet'])
  @IsNotEmpty()
  method: string;

  @IsString()
  @IsIn(['pending', 'completed', 'failed'])
  @IsNotEmpty()
  status: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;
}

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  customerPhone: string;

  @ValidateIf((o) => o.pickupMethod === 'delivery')
  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery: DeliveryDto;

  @ValidateNested()
  @Type(() => PaymentDto)
  payment: PaymentDto;

  @IsString()
  @IsIn(['delivery', 'pickup'])
  @IsNotEmpty()
  pickupMethod: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  tax: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  shippingCost: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  totalAmount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
