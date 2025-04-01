import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  createOrUpdate(@Body() createCartDto: CreateCartDto, @Req() req: any) {
    return this.cartService.createOrUpdateCart(createCartDto, req.user._id);
  }

  @Get()
  getCart(@Req() req: any) {
    const userId = req.user._id;
    return this.cartService.getCartByUserId(userId);
  }

  @Patch()
  updateCart(@Body() updateCartDto: UpdateCartDto, @Req() req: any) {
    const userId = req.user._id;

    return this.cartService.updateCart(userId, updateCartDto);
  }

  @Delete(':userId')
  clearCart(@Param('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
