import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  v2 as cloudinary,
  type UploadApiErrorResponse,
  type UploadApiOptions,
  type UploadApiResponse,
} from 'cloudinary';
import { CLOUDINARY } from './cloudinary.constants';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    @Inject(CLOUDINARY)
    private readonly cloudinaryClient: typeof cloudinary,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    options: UploadApiOptions = {},
  ): Promise<UploadApiResponse> {
    if (!file?.buffer) {
      throw new BadRequestException('File upload is required');
    }

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = this.cloudinaryClient.uploader.upload_stream(
        options,
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error || !result) {
            this.logger.error(
              'Cloudinary upload failed',
              error instanceof Error ? error.stack : JSON.stringify(error),
            );
            reject(new InternalServerErrorException('Unable to upload file'));
            return;
          }

          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<void> {
    if (!publicId) {
      throw new BadRequestException('Cloudinary public ID is required');
    }

    try {
      const result: unknown = await this.cloudinaryClient.uploader.destroy(
        publicId,
        {
          resource_type: resourceType,
          invalidate: true,
        },
      );

      if (
        typeof result !== 'object' ||
        result === null ||
        !('result' in result) ||
        typeof result.result !== 'string'
      ) {
        throw new Error('Invalid response from Cloudinary');
      }

      if (!['ok', 'not found'].includes(result.result)) {
        throw new Error(`Unexpected Cloudinary result: ${result.result}`);
      }
    } catch (error) {
      this.logger.error(
        `Cloudinary deletion failed for ${publicId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Unable to delete file');
    }
  }
}
