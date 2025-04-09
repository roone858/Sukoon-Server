import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MongoExceptionFilter } from './common/exceptions/mongo-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ValidationExceptionFilter } from './common/exceptions/validation-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // const corsSetting = {
  //   origin: process.env.CLIENT_BASE_URL, // السماح فقط للطلبات القادمة من هذا الدومين
  //   methods: 'GET,POST,PUT,DELETE', // تحديد أنواع الطلبات المسموح بها
  //   allowedHeaders: 'Content-Type, Authorization', // تحديد الهيدرز المسموح بها
  //   credentials: true, // السماح بإرسال الـ Cookies والجلسات
  // };
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // تحويل القيم بشكل تلقائي
      whitelist: true, // إزالة أي خصائص غير موجودة في الـ DTO
    }),
  );
  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new MongoExceptionFilter(),
  );
  const PORT = process.env.PORT || 3000; // تأكد من استخدام PORT
  await app.listen(PORT);
  console.log(`🚀 Server is running on port ${PORT}`);
}
bootstrap();
