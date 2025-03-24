import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './order.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderService } from './order.service';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    UsersModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, UsersService],
})
export class OrderModule {}
