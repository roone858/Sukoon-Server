import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Patch,
  UseGuards,
  ForbiddenException,
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
  createOrUpdate(@Body() createCartDto: CreateCartDto) {
    return this.cartService.createOrUpdateCart(createCartDto);
  }

  @Get(':userId')
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCartByUserId(userId);
  }

  @Patch(':userId')
  updateCart(
    @Param('userId') userId: string,
    @Body() updateCartDto: UpdateCartDto,
    @Req() req: any,
  ) {
    const loggedInUserId = req.user._id;

    if (userId !== loggedInUserId.toString()) {
      throw new ForbiddenException('You can only update your own cart'); // منع التعديل على سلات الآخرين
    }
    return this.cartService.updateCart(userId, updateCartDto);
  }

  @Delete(':userId')
  clearCart(@Param('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
