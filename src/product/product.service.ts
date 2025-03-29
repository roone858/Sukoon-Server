import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { v2 as cloudinary } from 'cloudinary';
import { ProductResponseDto } from './dto/response.product.dto';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productModel.find().lean().exec();
    return products.map(this.toProductResponseDto);
  }

  private toProductResponseDto(
    product: ProductDocument | any,
  ): ProductResponseDto {
    return {
      id: product._id?.toString() || product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      discount: product.discount,
      discountEndDate: product.discountEndDate,
      dimensions: product.dimensions,
      finalPrice:
        product.finalPrice ??
        product.price * (1 - (product.discount || 0) / 100),
      categories: product.categories || [],
      tags: product.tags || [],
      images: product.images || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async createWithImages(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    try {
      const uploadResults = await Promise.all(
        files.map((file) => this.uploadToCloudinary(file.buffer)),
      );

      const createdProduct = await this.productModel.create({
        ...createProductDto,
        images: uploadResults.map((result) => ({
          url: result.secure_url,
          public_id: result.public_id,
          altText: createProductDto.name,
        })),
      });

      return this.toProductResponseDto(
        createdProduct.toObject({ virtuals: true }),
      );
    } catch (error) {
      if (error.message.includes('Cloudinary')) {
        throw new InternalServerErrorException(
          'Failed to upload images to Cloudinary',
        );
      }

      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }

      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async updateWithImages(
    id: string,
    updateProductDto: UpdateProductDto,
    newFiles?: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Handle new image uploads
    let newImageResults: CloudinaryUploadResult[] = [];
    if (newFiles?.length) {
      newImageResults = await Promise.all(
        newFiles.map((file) => this.uploadToCloudinary(file.buffer)),
      );
    }

    // Handle image deletions
    if (updateProductDto.imagesToDelete?.length) {
      await this.deleteImagesFromCloudinary(updateProductDto.imagesToDelete);
    }

    // Prepare the update object
    const update: any = {
      $set: {
        name: updateProductDto.name,
        description: updateProductDto.description,
        price: updateProductDto.price,
        stock: updateProductDto.stock,
        discount: updateProductDto.discount,
        dimensions: updateProductDto.dimensions || [],
        discountEndDate: updateProductDto.discountEndDate,
        categories: updateProductDto.categories,
        tags: updateProductDto.tags,
      },
    };

    // Handle images array modifications
    if (updateProductDto.imagesToDelete?.length) {
      update.$pull = {
        images: { public_id: { $in: updateProductDto.imagesToDelete } },
      };
    }

    if (newImageResults.length > 0) {
      update.$push = {
        images: {
          $each: newImageResults.map((result) => ({
            url: result.secure_url,
            public_id: result.public_id,
            altText: updateProductDto.name || product.name,
          })),
        },
      };
    }

    // Perform the update
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found after update');
    }

    return this.toProductResponseDto(
      updatedProduct.toObject({ virtuals: true }),
    );
  }
  async delete(id: string): Promise<{ success: boolean }> {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.images?.length) {
      await this.deleteImagesFromCloudinary(
        product.images.map((img) => img.public_id),
      );
    }

    return { success: true };
  }

  private async uploadToCloudinary(
    buffer: Buffer,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else if (!result) reject(new Error('Upload failed'));
          else
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
        },
      );
      uploadStream.end(buffer);
    });
  }

  private async deleteImagesFromCloudinary(publicIds: string[]): Promise<void> {
    await Promise.all(
      publicIds.map((publicId) =>
        cloudinary.uploader.destroy(publicId).catch(console.error),
      ),
    );
  }
}
