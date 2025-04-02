import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { RemoveFromWishlistDto } from './dto/remove-from-wishlist.dto';
@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async addToWishlist(userId: string, addToWishlistDto: AddToWishlistDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Initialize wishlist array if it doesn't exist
    if (!user.wishlist) {
      user.wishlist = [];
    }
    const exists = user.wishlist.some(
      (id) => id.toString() === addToWishlistDto.productId.toString(),
    );

    if (exists) {
      return user.wishlist;
    }
    // Add product to wishlist
    user.wishlist.push(addToWishlistDto.productId as any);
    await user.save();
    return user.wishlist;
  }

  async removeFromWishlist(
    userId: string,
    removeFromWishlistDto: RemoveFromWishlistDto,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.wishlist) {
      return user.wishlist;
    }

    // Remove product from wishlist
    user.wishlist = user.wishlist.filter(
      (productId) =>
        productId.toString() !== removeFromWishlistDto.productId.toString(),
    );
    await user.save();
    return user.wishlist;
  }

  async getWishlist(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.wishlist || [];
  }

  async clearWishlist(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.wishlist = [];
    await user.save();
    return user.wishlist;
  }
}
