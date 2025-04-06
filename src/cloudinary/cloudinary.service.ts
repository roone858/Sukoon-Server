import {
  Injectable,
  Inject,
  InternalServerErrorException,
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
}
