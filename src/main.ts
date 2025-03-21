import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MongoExceptionFilter } from './common/exceptions/mongo-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const corsSetting = {
  //   origin: process.env.CLIENT_BASE_URL, // السماح فقط للطلبات القادمة من هذا الدومين
  //   methods: 'GET,POST,PUT,DELETE', // تحديد أنواع الطلبات المسموح بها
  //   allowedHeaders: 'Content-Type, Authorization', // تحديد الهيدرز المسموح بها
  //   credentials: true, // السماح بإرسال الـ Cookies والجلسات
  // };
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new MongoExceptionFilter());
  await app.listen(3000);
}
bootstrap();
