import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { ProductModule } from './product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { v2 as cloudinary } from 'cloudinary';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    AuthModule,
    JwtModule,
    UsersModule,
    ProductModule,
    CartModule,
    OrderModule,
    ReviewModule,
    WishlistModule,
  ],
  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: 'CLOUDINARY',
      useValue: cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      }),
    },
  ],
})
export class AppModule {}
