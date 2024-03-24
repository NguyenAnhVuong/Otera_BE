import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/core/decorator/public.decorator';
import { CloudinaryService } from './cloudinary.service';
import { Roles } from '@core/decorator/roles.decorator';
import { ERole } from '@core/enum';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  // All roles can upload image
  @Roles(Object.values(ERole))
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadImage(file);
  }

  @Post('uploads')
  @Roles(Object.values(ERole))
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    console.log('Object.values(ERole): ', Object.values(ERole));
    return this.cloudinaryService.uploadImages(files);
  }

  @Roles(Object.values(ERole))
  @Delete('delete/:publicId')
  async deleteImage(@Param('publicId') publicId: string) {
    return this.cloudinaryService.deleteImage(publicId);
  }
}
