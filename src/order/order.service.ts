import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  private async generateOrderNumber(): Promise<string> {
    // Get the current date components
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Get the count of orders for today
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const count = await this.orderModel.countDocuments({
      createdAt: { $gte: today },
    });

    // Generate order number: YYMMDD-XXXX (where XXXX is a 4-digit sequence number)
    const sequence = (count + 1).toString().padStart(4, '0');
    return `${year}${month}${day}-${sequence}`;
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNumber = await this.generateOrderNumber();
    const order = new this.orderModel({
      ...createOrderDto,
      orderNumber,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          note: 'Order created',
        },
      ],
    });
    return order.save();
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderModel.find().exec();
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const orders = await this.orderModel.find({ userId: userId }).exec();
    return orders;
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    // First, check if the order exists
    const existingOrder = await this.orderModel.findById(id).exec();
    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }

    // Create a copy of updateOrderDto without statusHistory
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { statusHistory: ignored, ...updateData } = updateOrderDto as any;

    // Prepare the update operation
    const update: any = {
      $set: updateData,
    };

    // If status has changed, add a new status history entry
    if (updateData.status && updateData.status !== existingOrder.status) {
      update.$push = {
        statusHistory: {
          status: updateData.status,
          timestamp: new Date(),
          note: 'Order details updated',
        },
      };
    }

    // Perform the update
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }

    return updatedOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(
        id,
        {
          status,
          $push: {
            statusHistory: {
              status,
              timestamp: new Date(),
              note: `Order status updated to ${status}`,
            },
          },
        },
        { new: true },
      )
      .exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async deleteOrder(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Order not found');
  }
}
