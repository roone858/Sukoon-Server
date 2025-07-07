import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AdminGuard } from 'src/users/guards/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/decorators/user.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get()
  findAll() {
    return this.orderService.getAllOrders();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-orders')
  findMyOrders(@Request() req: any) {
    return this.orderService.getOrdersByUserId(req.user._id.toString());
  }

  @Get('/number/:orderNumber')
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.orderService.findByOrderNumber(orderNumber);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.orderService.getOrderById(id);
    // // Allow access if user is admin or if the order belongs to the user
    // if (
    //   user.role !== 'admin' &&
    //   order.userId?.toString() !== user._id.toString()
    // ) {
    //   throw new ForbiddenException('You can only access your own orders');
    // }
    return order;
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.updateOrder(id, updateOrderDto);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.orderService.updateOrderStatus(id, status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string, @User() user: any) {
    const order = await this.orderService.getOrderById(id);
    // Allow deletion if user is admin or if the order belongs to the user
    if (
      user.role !== 'admin' ||
      order.userId?.toString() !== user._id.toString()
    ) {
      throw new ForbiddenException('You can only delete your own orders');
    }
    return this.orderService.deleteOrder(id);
  }
}
