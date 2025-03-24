import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AdminGuard } from 'src/users/guards/admin.guard';
import { AuthGuard } from '@nestjs/passport';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.orderService.updateOrderStatus(id, status);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.deleteOrder(id);
  }
}
