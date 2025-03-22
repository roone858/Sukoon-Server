import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { join } from 'path';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/users/guards/admin.guard';
import { ProductService } from './product.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    // private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get()
  async getImages(@Res() res: Response) {
    const products = await this.productService.findAll();
    res.json(products);
  }

  @Get('/:image')
  async getImage(
    @Param('image') image: string,
    @Query('width') width: string,
    @Res() res: Response,
  ) {
    const inputImagePath = join(__dirname, '..', '..', 'images', image);
    res.sendFile(inputImagePath);
  }

  // @Get('details/:imageName')
  // async getFileDetails(
  //   @Param('imageName') imageName: string,
  //   @Res() res: Response,
  // ) {
  //   const data = await this.productService.findByFileName(imageName);
  //   res.json(data);
  // }

  // @Post()
  // @UseGuards(AuthGuard('jwt'))
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: diskStorage({
  //       destination: './images', // Specify the directory where files will be stored
  //       filename: (req, file, cb) => {
  //         const fileExtension = path.extname(file.originalname);
  //         const name = path.basename(
  //           file.originalname,
  //           path.extname(file.originalname),
  //         );
  //         const fileName = name + Date.now() + fileExtension;

  //         cb(null, fileName);
  //       },
  //     }),
  //   }),
  // )
  // async uploadProduct(
  //   @UploadedFile() file,
  //   @User() user: UserDocument,
  //   @Body() body,
  // ) {
  //   const tags = body.tags;
  //   const imageDetails = await this.productService.calculateImageDetails(
  //     file,
  //     body.title,
  //     body.description,
  //     tags,
  //     body.categoryId,
  //     user._id.toString(),
  //   );
  //   const inputImagePath = join(
  //     __dirname,
  //     '..',
  //     '..',
  //     'uploads',
  //     imageDetails.fileName,
  //   );

  //   // await this.productService.addWatermark(inputImagePath, outputImagePath);
  //   return this.productService.create(imageDetails);
  // }

  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @UseInterceptors(
    FilesInterceptor('images', 22, {
      storage: diskStorage({
        destination: './images',
        filename: (req, file, cb) => {
          const fileExtension = path.extname(file.originalname);
          const name = path.basename(file.originalname, fileExtension);
          const fileName = `${name}-${Date.now()}${fileExtension}`;
          cb(null, fileName);
        },
      }),
    }),
  )
  async uploadProduct(
    @UploadedFiles() images,
    // @User() user: UserDocument,
    @Body() { name, price, description, category }: any,
  ) {
    const imagesNames = images.map(
      (file) => process.env.SERVER_BASE_URL + '/products/' + file.filename,
    );
    console.log(imagesNames);
    // return { name, price, category, description, imagesNames };
    return this.productService.create({
      name,
      price,
      category,
      description,
      images: imagesNames,
    });
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FilesInterceptor('newImages', 22, {
      storage: diskStorage({
        destination: './images',
        filename: (req, file, cb) => {
          const fileExtension = path.extname(file.originalname);
          const name = path.basename(file.originalname, fileExtension);
          const fileName = `${name}-${Date.now()}${fileExtension}`;
          cb(null, fileName);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFiles() newImages,
    @Body() updateProduct: UpdateProductDto,
  ) {
    const newImagesUrl = newImages.map(
      (file) => process.env.SERVER_BASE_URL + '/products/' + file.filename,
    );
    return this.productService.update(id, updateProduct, newImagesUrl);
    // return this.productService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async delete(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
