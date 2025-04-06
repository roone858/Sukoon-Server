import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../users/guards/admin.guard';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProducts() {
    return this.productService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('images', 10)) // Reduced from 22 to 10
  async createProduct(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ) {
    console.log('عدى هنا');
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }
    console.log(createProductDto);
    if (typeof createProductDto.dimensions === 'string') {
      console.log('transaction');
      createProductDto.dimensions = JSON.parse(createProductDto.dimensions);
    }
    return this.productService.createWithImages(createProductDto, files);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('newImages', 10))
  async updateProduct(
    @Param('id') id: string,
    @UploadedFiles() newFiles: Express.Multer.File[],
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.updateWithImages(id, updateProductDto, newFiles);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteProduct(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
