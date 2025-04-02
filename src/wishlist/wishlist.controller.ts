import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { RemoveFromWishlistDto } from './dto/remove-from-wishlist.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('wishlist')
@Controller('wishlist')
@UseGuards(AuthGuard('jwt'))
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('add')
  @ApiOperation({ summary: 'Add a product to wishlist' })
  @ApiResponse({
    status: 200,
    description: 'Product added to wishlist successfully',
  })
  async addToWishlist(
    @Request() req,
    @Body() addToWishlistDto: AddToWishlistDto,
  ) {
    return this.wishlistService.addToWishlist(req.user._id, addToWishlistDto);
  }

  @Delete('remove')
  @ApiOperation({ summary: 'Remove a product from wishlist' })
  @ApiResponse({
    status: 200,
    description: 'Product removed from wishlist successfully',
  })
  async removeFromWishlist(
    @Request() req,
    @Body() removeFromWishlistDto: RemoveFromWishlistDto,
  ) {
    return this.wishlistService.removeFromWishlist(
      req.user._id,
      removeFromWishlistDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiResponse({ status: 200, description: 'Returns the user wishlist' })
  async getWishlist(@Request() req) {
    return this.wishlistService.getWishlist(req.user._id);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear entire wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist cleared successfully' })
  async clearWishlist(@Request() req) {
    return this.wishlistService.clearWishlist(req.user._id);
  }
}
