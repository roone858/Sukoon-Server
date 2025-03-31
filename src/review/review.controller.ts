import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Ip,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('product/:productId')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('productId') productId: string,
    @Body() createReviewDto: CreateReviewDto,
    @Ip() ipAddress: string,
  ) {
    return this.reviewService.create(
      { ...createReviewDto, productId },
      ipAddress,
    );
  }

  @Get('product/:productId')
  findAll(@Param('productId') productId: string) {
    return this.reviewService.findAll(productId);
  }

  @Get('product/:productId/stats')
  getReviewStats(@Param('productId') productId: string) {
    return this.reviewService.getReviewStats(productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ) {
    return this.reviewService.update(id, updateReviewDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewService.remove(id, req.user.id);
  }
}
