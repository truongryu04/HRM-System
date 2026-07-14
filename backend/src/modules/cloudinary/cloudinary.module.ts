import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { cloudinaryProvider } from './cloudinary.provider';

@Global()
@Module({
  providers: [cloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
