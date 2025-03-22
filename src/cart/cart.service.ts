import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  async createOrUpdateCart(createCartDto: CreateCartDto): Promise<Cart> {
    const { userId, items } = createCartDto;
    const cart = await this.cartModel.findOneAndUpdate(
      { userId },
      { items, updatedAt: new Date() },
      { new: true, upsert: true },
    );
    return cart;
  }

  async getCartByUserId(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
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

    updateCartDto.items.forEach((updatedItem) => {
      const existingItem = cart.items.find(
        (item) => item.productId === updatedItem.productId,
      );
      if (existingItem) {
        existingItem.quantity = updatedItem.quantity ?? existingItem.quantity; // استخدم الكمية الحالية إذا لم تُرسل
      } else {
        cart.items.push({
          productId: updatedItem.productId,
          quantity: updatedItem.quantity ?? 1, // تعيين `1` إذا لم يتم تحديد كمية
        });
      }
    });

    cart.updatedAt = new Date();
    return cart.save();
  }
  async clearCart(userId: string): Promise<void> {
    await this.cartModel.findOneAndDelete({ userId }).exec();
  }
}
