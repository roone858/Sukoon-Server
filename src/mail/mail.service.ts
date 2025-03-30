import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as dotenv from 'dotenv';
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
        template: './confirmation.hbs',
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
}
