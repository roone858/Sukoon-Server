import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/users/guards/admin.guard';
import { ProductService } from './product.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { Response } from 'express';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getImages(@Res() res: Response) {
    const products = await this.productService.findAll();
    res.json(products);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @UseInterceptors(FilesInterceptor('images', 22))
  async uploadProduct(
    @UploadedFiles() images,
    @Body() { name, price, description, category }: any,
  ) {
    const uploadPromises = images.map(
      (file) =>
        new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ resource_type: 'auto' }, (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            })
            .end(file.buffer);
        }),
    );

    const imagesUrls = await Promise.all(uploadPromises);

    return this.productService.create({
      name,
      price,
      category,
      description,
      images: imagesUrls,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('newImages', 22))
  async update(
    @Param('id') id: string,
    @UploadedFiles() newImages,
    @Body() updateProduct: UpdateProductDto,
  ) {
    let newImagesUrl = [];
    if (newImages && newImages.length > 0) {
      const uploadPromises = newImages.map(
        (file) =>
          new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ resource_type: 'auto' }, (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              })
              .end(file.buffer);
          }),
      );
      newImagesUrl = await Promise.all(uploadPromises);
    }

    return this.productService.update(id, updateProduct, newImagesUrl);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async delete(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
