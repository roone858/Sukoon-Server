// whatsapp/whatsapp.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class WhatsAppService {
  constructor(private readonly httpService: HttpService) {}

  private readonly apiUrl =
    'https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages';
  private readonly accessToken = 'YOUR_WHATSAPP_ACCESS_TOKEN';

  sendMessage(phoneNumber: string, message: string): Observable<any> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phoneNumber,
      type: 'text',
      text: {
        body: message,
      },
    };

    return this.httpService.post(this.apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }
  async sendTemplateMessage(
    phone: string,
    templateName: string,
    parameters: string[],
    language: string = 'ar',
  ): Promise<any> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language, // 'ar' للغة العربية
        },
        components: [
          {
            type: 'body',
            parameters: parameters.map((value) => ({
              type: 'text',
              text: value,
            })),
          },
        ],
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, payload, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `WhatsApp API Error: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }
}
