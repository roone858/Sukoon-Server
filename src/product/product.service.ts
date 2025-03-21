import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import * as fs from 'fs';
import * as path from 'path';
import sizeOf from 'image-size';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}

  /** 🆕 Create a new product */
  async create(productData: CreateProductDto): Promise<Product> {
    return new this.productModel(productData).save();
  }

  /** 📂 Retrieve all products */
  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  /** 🔍 Find products by title */
  async findAllByTitle(title: string): Promise<Product[]> {
    return this.productModel.find({ title: new RegExp(title, 'i') }).exec();
  }

  /** 🔍 Find product by file name */
  async findByFileName(fileName: string): Promise<Product | null> {
    return this.productModel.findOne({ fileName }).exec();
  }

  /** 🔍 Find product by ID */
  async findById(id: string): Promise<Product | null> {
    return this.productModel.findById(id).exec();
  }

  /** ✏️ Update a product */
  async update(
    id: string,
    updateProduct: UpdateProductDto,
    newImagesUrl: string[],
  ): Promise<Product | null> {
    const product = await this.productModel.findById(id).exec();
    const removedImage = product.images.filter(
      (image: string) => !updateProduct.images.includes(image),
    );
    removedImage.forEach((imageUrl) => {
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'images',
        imageUrl.split('/').pop(),
      );
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Error deleting file: ${err.message}`);
      });
    });
    updateProduct.images = [...updateProduct.images, ...newImagesUrl];
    return this.productModel
      .findByIdAndUpdate(id, updateProduct, { new: true })
      .exec();
  }

  /** ❌ Delete a product and remove associated file */
  async delete(id: string): Promise<Product | null> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    product.images.forEach((imageUrl) => {
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'images',
        imageUrl.split('/').pop(),
      );
      fs.unlink(filePath, (err) => {
        if (err) console.error(`Error deleting file: ${err.message}`);
      });
    });
    // Remove the associated file

    return this.productModel.findByIdAndDelete(id).exec();
  }

  /** 📏 Calculate image details */
  async calculateImageDetails(
    file: any,
    title: string,
    description: string,
    tags: string[],
    categoryId: string,
    userId: string,
  ): Promise<any> {
    try {
      const { size: fileSizeInBytes } = fs.statSync(file.path);
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024); // Convert bytes to MB
      const extension = path.extname(file.originalname);
      const dimensions = sizeOf(file.path);
      const dpi = 72;
      const resolutionX = Math.round(dimensions.width / (dpi / 25.4));
      const resolutionY = Math.round(dimensions.height / (dpi / 25.4));

      return {
        title,
        description,
        tags,
        category: categoryId,
        fileName: file.filename,
        metadata: {
          size: fileSizeInMB.toFixed(2),
          resolution: `${resolutionX}x${resolutionY}`,
          format: extension,
        },
        uploader: userId,
        downloadStatistics: { downloadCount: 0, likes: 0 },
      };
    } catch (error) {
      throw new Error('Error calculating image details');
    }
  }

  // /** 🌊 Add watermark to an image */
  // async addWatermark(
  //   inputImagePath: string,
  //   outputImagePath: string,
  // ): Promise<void> {
  //   try {
  //     const image = await Jimp.read(inputImagePath);
  //     image.resize(500, Jimp.AUTO); // Resize image

  //     // Create watermark image
  //     const watermarkText = 'Pixel';
  //     const watermarkImage = new Jimp(image.getWidth(), image.getHeight());

  //     // Load font
  //     const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  //     const stepSize = 100;

  //     // Apply watermark text in a repeated pattern
  //     for (let x = 0; x < image.getWidth(); x += stepSize) {
  //       for (let y = 0; y < image.getHeight(); y += stepSize) {
  //         watermarkImage.print(font, x, y, watermarkText);
  //       }
  //     }

  //     // Merge watermark onto image
  //     image.composite(watermarkImage, 0, 0, {
  //       mode: Jimp.BLEND_SOURCE_OVER,
  //       opacitySource: 0.5, // Adjust the opacity as needed
  //       opacityDest: 1, // This is required in BlendMode
  //     });

  //     // Save output file with .jpg extension
  //     const outputImagePathWithExtension = outputImagePath.replace(
  //       /\.[^/.]+$/,
  //       '.jpg',
  //     );
  //     await image.writeAsync(outputImagePathWithExtension);
  //   } catch (error) {
  //     console.error('Error adding watermark:', error);
  //   }
  // }
}
