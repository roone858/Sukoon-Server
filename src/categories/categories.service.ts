import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    image: Express.Multer.File,
  ): Promise<Category> {
    const createdCategory = new this.categoryModel(createCategoryDto);

    if (createCategoryDto.parentId) {
      const parent = await this.categoryModel.findById(
        createCategoryDto.parentId,
      );
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      createdCategory.ancestors = [
        ...parent.ancestors,
        {
          _id: parent._id as MongooseSchema.Types.ObjectId,
          name: parent.name,
          slug: parent.slug,
        },
      ];
      createdCategory.level = parent.level + 1;
    } else {
      createdCategory.level = 0;
    }

    // 1. Save category first without image
    const savedCategory = await createdCategory.save();

    // 2. If image is provided, upload and update category
    if (image) {
      const imageUrl = (await this.cloudinaryService.uploadFile(image)).url;
      savedCategory.imageUrl = imageUrl;
      await savedCategory.save(); // update with image
    }

    return savedCategory;
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findProductsByCategory(categoryId: string): Promise<Product[]> {
    // Fetch all categories once
    const allCategories = await this.categoryModel.find().lean();
    // Find the target category
    const targetCategory = allCategories.find(
      (cat) => cat._id.toString() === categoryId,
    );
    if (!targetCategory) throw new NotFoundException('Category not found');

    // Helper to recursively collect all descendant category IDs
    const collectDescendantIds = (
      parentId: string,
      categories: any[],
    ): string[] => {
      const children = categories.filter(
        (cat) => String(cat.parentId) === String(parentId),
      );
      return children.reduce<string[]>(
        (acc, child) => [
          ...acc,
          child._id.toString(),
          ...collectDescendantIds(child._id.toString(), categories),
        ],
        [],
      );
    };

    // // Collect ancestor IDs
    // const ancestorIds = (targetCategory.ancestors || []).map((a) =>
    //   a._id.toString(),
    // );

    // Collect descendant IDs
    const descendantIds = collectDescendantIds(categoryId, allCategories);

    // Combine all related category IDs, ensuring uniqueness
    const allRelatedCategoryIds = Array.from(
      new Set([categoryId, ...descendantIds]),
      // new Set([categoryId, ...ancestorIds, ...descendantIds]),
    );
    // Fetch products that belong to any of the related categories
    return this.productModel
      .find({ categories: { $in: allRelatedCategoryIds } })
      .populate('categories')
      .lean();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file: Express.Multer.File,
  ): Promise<Category> {
    let imageUrl = updateCategoryDto.imageUrl;
    if (file) {
      if (imageUrl)
        await this.cloudinaryService.deleteFileWithUrl(
          updateCategoryDto.imageUrl,
        );
      const result = await this.cloudinaryService.uploadFile(file);
      imageUrl = result.url;
      updateCategoryDto.imageUrl = imageUrl;
    }
    const updateData = { ...updateCategoryDto };
    const existingCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    return existingCategory;
  }

  async remove(id: string): Promise<Category> {
    const deletedCategory = await this.categoryModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedCategory) {
      throw new NotFoundException('Category not found');
    }
    return deletedCategory;
  }

  async getSubcategories(parentId: string): Promise<Category[]> {
    return this.categoryModel.find({ parentId }).exec();
  }

  async getCategoryTree(): Promise<any[]> {
    const categories = await this.categoryModel.find().exec();
    return this.buildTree(categories);
  }

  private buildTree(
    categories: CategoryDocument[],
    parentId: Types.ObjectId | null = null,
  ): any[] {
    return categories
      .filter((category) => {
        const categoryParentId = category.parentId as unknown as Types.ObjectId;
        return (
          (parentId === null && !categoryParentId) ||
          (categoryParentId && categoryParentId.equals(parentId))
        );
      })
      .map((category) => ({
        ...category.toObject(),
        children: this.buildTree(categories, category._id as Types.ObjectId),
      }));
  }
}
