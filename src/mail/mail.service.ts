import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as dotenv from 'dotenv';
import { OrderDocument } from 'src/order/schemas/order.schema';
dotenv.config();

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL,
        to: to,
        subject: 'Welcome to Sukoon - Verify Your Email',
        template: './confirmation',
        context: {
          token: token,
          clientUrl: process.env.CLIENT_BASE_URL,
        },
      };

      await this.mailerService.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending verification email:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          template: 'confirmation.hbs',
        });
      }
      throw error;
    }
  }

  async sendOrderConfirmationEmail(order: OrderDocument) {
    const orderObject = order.toObject();

    const mailOptions = {
      to: order.customerEmail,
      subject: `تفاصيل طلبك #${order.orderNumber}`,
      template: './order-confirmation', // path to your template file
      context: {
        orderNumber: order.orderNumber,
        createdAt: orderObject.createdAt.toLocaleDateString('ar-SA'),
        status: order.status,
        pickupMethod: order.pickupMethod === 'delivery' ? 'توصيل' : 'استلام',
        subtotal: order.subtotal.toFixed(2),
        tax: order.tax.toFixed(2),
        shippingCost: order.shippingCost.toFixed(2),
        totalAmount: order.totalAmount.toFixed(2),
        delivery: orderObject.delivery ? { ...orderObject.delivery } : null,
        items: orderObject.items.map((item) => ({ ...item })),
        payment: { ...orderObject.payment },
        notes: order.notes,
        clientUrl: process.env.CLIENT_BASE_URL,
      },
    };

    await this.mailerService.sendMail(mailOptions);
  }
}
