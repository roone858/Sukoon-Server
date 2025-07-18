import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { AdminGuard } from 'src/users/guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductResponseDto } from 'src/product/dto/response.product.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created',
    type: CategoryResponseDto,
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoriesService.create(createCategoryDto, file);
  }

  // GET /categories/:categoryId/products
  @Get(':id/products')
  @ApiOperation({ summary: 'Get products by category ID' })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: [ProductResponseDto],
  })
  async getProductByCategory(@Param('id') id: string) {
    return this.categoriesService.findProductsByCategory(id);
  }
  // GET /categories
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
    type: [CategoryResponseDto],
  })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree' })
  @ApiResponse({ status: 200, description: 'Category tree' })
  async getTree() {
    return this.categoriesService.getCategoryTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({
    status: 200,
    description: 'Category details',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id/subcategories')
  @ApiOperation({ summary: 'Get subcategories' })
  @ApiResponse({
    status: 200,
    description: 'List of subcategories',
    type: [CategoryResponseDto],
  })
  async getSubcategories(@Param('id') parentId: string) {
    return this.categoriesService.getSubcategories(parentId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({
    status: 200,
    description: 'Updated category',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({
    status: 200,
    description: 'Deleted category',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
