// cart-item.dto.ts
export class CartItemResponseDto {
  productId: string;
  name: string;
  originalPrice: number;
  discountPercentage: number;
  finalPrice: number; // السعر بعد الخصم
  quantity: number;
  itemTotal: number; // finalPrice * quantity
  image: string;
}

// cart-response.dto.ts
export class CartResponseDto {
  userId: string;
  items: CartItemResponseDto[];
  updatedAt: Date;
}
