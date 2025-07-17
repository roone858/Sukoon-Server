import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductSchema } from './schemas/product.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { ProductService } from './product.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    CloudinaryModule,
    UsersModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, UsersService],
  exports: [ProductService],
})
export class ProductModule {}
