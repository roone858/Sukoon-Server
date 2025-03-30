import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsIn,
  IsEmail,
  IsPhoneNumber,
  Min,
} from 'class-validator';

// Define the DTO for items in the order
class OrderItemDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  quantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  subtotal?: number;
}

// Define the DTO for delivery information
class DeliveryDto {
  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
}

// Define the DTO for payment information
class PaymentDto {
  @IsString()
  @IsIn(['cash', 'card', 'wallet'])
  @IsOptional()
  method?: string;

  @IsString()
  @IsIn(['pending', 'completed', 'failed'])
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;
}

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsOptional()
  items?: OrderItemDto[];

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @IsPhoneNumber()
  @IsOptional()
  customerPhone?: string;

  @ValidateNested()
  @Type(() => DeliveryDto)
  @IsOptional()
  delivery?: DeliveryDto;

  @ValidateNested()
  @Type(() => PaymentDto)
  @IsOptional()
  payment?: PaymentDto;

  @IsString()
  @IsIn(['delivery', 'pickup'])
  @IsOptional()
  pickupMethod?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  subtotal?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tax?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  shippingCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalAmount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsIn([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  cancellationReason?: string;
}
