import {
  Injectable,
  Inject,
  InternalServerErrorException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { Readable } from 'stream';
import { CloudinaryResponse } from './cloudinary-response';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinary: any) {}

  async uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    try {
      if (!this.cloudinary?.uploader) {
        throw new Error('Cloudinary uploader is not configured');
      }
      return await new Promise((resolve, reject) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) {
              return reject(
                new InternalServerErrorException(
                  `Cloudinary Upload Error: ${error.message}`,
                ),
              );
            }
            resolve(result);
          },
        );

        Readable.from(file.buffer).pipe(uploadStream);
      });
    } catch (err) {
      throw new InternalServerErrorException(`Upload failed: ${err.message}`);
    }
  }

  async deleteFile(publicId: string): Promise<any> {
    try {
      const result = await this.cloudinary.uploader.destroy(publicId);
      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new InternalServerErrorException(
          `Failed to delete image: ${result.result}`,
        );
      }
      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        `Cloudinary Delete Error: ${err.message}`,
      );
    }
  }
  async deleteFileWithUrl(url: string): Promise<any> {
    try {
      // Extract public ID from Cloudinary URL
      const publicId = this.extractPublicIdFromUrl(url);

      if (!publicId) {
        throw new BadRequestException('Invalid Cloudinary URL');
      }

      const result = await this.cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new InternalServerErrorException(
          `Failed to delete image: ${result.result}`,
        );
      }

      return result;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Cloudinary Delete Error: ${err.message}`,
      );
    }
  }

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      // Cloudinary URL pattern: https://res.cloudinary.com/<cloud_name>/<resource_type>/<type>/<version>/<public_id>.<format>
      const matches = url.match(/(?:image\/upload\/)(?:v\d+\/)?([^\.]+)/);
      return matches ? matches[1] : null;
    } catch {
      return null;
    }
  }
}
