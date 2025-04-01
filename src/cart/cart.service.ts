import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CartResponseDto } from './dto/response.cart.dto';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  async createOrUpdateCart(
    createCartDto: CreateCartDto,
    userId: string,
  ): Promise<Cart> {
    const { items } = createCartDto;
    const cart = await this.cartModel.findOneAndUpdate(
      { userId },
      { items, updatedAt: new Date() },
      { new: true, upsert: true },
    );
    return cart;
  }

  async getCartByUserId(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate({
        path: 'items.productId',
        select: 'name price images discount dimensions',
      })
      .exec();
    if (!cart) throw new NotFoundException('Cart not found');

    const response: CartResponseDto = {
      userId: cart.userId.toString(),
      items: await Promise.all(
        cart.items.map(async (item) => {
          const product = item.productId as any;

          // تحديد السعر بناءً على وجود البعد
          let basePrice = product.price;
          let selectedDimension = null;

          if (item.dimensionId && product.dimensions) {
            selectedDimension = product.dimensions.find(
              (dim: any) => dim._id.toString() === item.dimensionId.toString(),
            );
            if (selectedDimension) {
              basePrice = selectedDimension.price;
            }
          }

          const discount = product.discount || 0;
          const finalPrice = basePrice * (1 - discount / 100);

          return {
            productId: product._id.toString(),
            dimensionId: item.dimensionId?.toString(),
            name: product.name,
            originalPrice: basePrice,
            discountPercentage: discount,
            finalPrice: finalPrice,
            quantity: item.quantity,
            itemTotal: finalPrice * item.quantity,
            image: product.images?.[0]?.url || '',
          };
        }),
      ),
      updatedAt: cart.updatedAt,
    };

    return response;
  }
  async updateCart(
    userId: string,
    updateCartDto: UpdateCartDto,
  ): Promise<Cart> {
    let cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) {
      cart = new this.cartModel({
        userId,
        items: [],
        updatedAt: new Date(),
      });
    }

    cart.items = updateCartDto.items.map((item) => ({
      productId: new Types.ObjectId(item.productId),
      dimensionId: item.dimensionId
        ? new Types.ObjectId(item.dimensionId)
        : undefined,
      quantity: item.quantity,
    }));

    cart.updatedAt = new Date();
    return cart.save();
  }
  async clearCart(userId: string): Promise<void> {
    await this.cartModel.findOneAndDelete({ userId }).exec();
  }
}
