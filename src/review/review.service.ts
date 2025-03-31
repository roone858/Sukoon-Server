import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    ipAddress: string,
  ): Promise<Review> {
    // Validate that either userId or guestName is provided
    if (!createReviewDto.userId && !createReviewDto.guestName) {
      throw new BadRequestException(
        'Either userId or guestName must be provided',
      );
    }

    // Check for spam (multiple reviews from same IP within 24 hours)
    const recentReview = await this.reviewModel.findOne({
      ipAddress,
      productId: createReviewDto.productId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (recentReview) {
      throw new BadRequestException(
        'You can only submit one review per product every 24 hours',
      );
    }

    const review = new this.reviewModel({
      ...createReviewDto,
      ipAddress,
      createdAt: new Date(),
    });

    const savedReview = await review.save();
    return this.reviewModel
      .findById(savedReview._id)
      .populate('userId', 'name')
      .exec();
  }

  async findAll(productId: string): Promise<Review[]> {
    const reviews = await this.reviewModel
      .find({ productId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .exec();

    if (!reviews.length) {
      return [];
    }

    return reviews;
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewModel
      .findById(id)
      .populate('userId', 'name')
      .exec();

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    userId: string,
  ): Promise<Review> {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only allow users to update their own reviews
    if (review.userId && review.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Prevent guest reviews from being updated
    if (!review.userId) {
      throw new ForbiddenException('Guest reviews cannot be updated');
    }

    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(id, updateReviewDto, { new: true })
      .populate('userId', 'name')
      .exec();

    return updatedReview;
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Only allow users to delete their own reviews
    if (review.userId && review.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Prevent guest reviews from being deleted
    if (!review.userId) {
      throw new ForbiddenException('Guest reviews cannot be deleted');
    }

    await this.reviewModel.findByIdAndDelete(id).exec();
  }

  async getAverageRating(productId: string): Promise<number> {
    const result = await this.reviewModel.aggregate([
      { $match: { productId } },
      { $group: { _id: null, average: { $avg: '$rating' } } },
    ]);
    return result.length > 0 ? result[0].average : 0;
  }

  async getReviewStats(productId: string): Promise<{
    average: number;
    total: number;
    ratingDistribution: Record<number, number>;
    userReviews: number;
    guestReviews: number;
  }> {
    const stats = await this.reviewModel.aggregate([
      { $match: { productId } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          total: { $sum: 1 },
          userReviews: {
            $sum: { $cond: [{ $ifNull: ['$userId', false] }, 1, 0] },
          },
          guestReviews: {
            $sum: { $cond: [{ $ifNull: ['$guestName', false] }, 1, 0] },
          },
          distribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        average: 0,
        total: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        userReviews: 0,
        guestReviews: 0,
      };
    }

    const distribution = stats[0].distribution.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    return {
      average: Number(stats[0].average.toFixed(1)),
      total: stats[0].total,
      ratingDistribution: {
        1: distribution[1] || 0,
        2: distribution[2] || 0,
        3: distribution[3] || 0,
        4: distribution[4] || 0,
        5: distribution[5] || 0,
      },
      userReviews: stats[0].userReviews,
      guestReviews: stats[0].guestReviews,
    };
  }
}
