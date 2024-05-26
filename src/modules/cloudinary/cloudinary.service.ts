import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');
import { ConfigService } from '@nestjs/config';
import { EConfiguration } from '@core/config';
@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {}

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      toStream(file.buffer).pipe(upload);
    });
  }

  async uploadImages(files: Express.Multer.File[]) {
    return Promise.all(files.map((file) => this.uploadImage(file)));
  }

  async deleteImage(publicId: string) {
    return new Promise((resolve, reject) => {
      v2.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  async deleteImages(publicIds: string[]) {
    return Promise.all(publicIds.map((publicId) => this.deleteImage(publicId)));
  }

  async deleteImagesByUrls(urls: string[]) {
    const defaultAvatarURL = this.configService.get<string>(
      EConfiguration.DEFAULT_AVATAR_URL,
    );

    const defaultEventAvatarURL = this.configService.get<string>(
      EConfiguration.DEFAULT_EVENT_AVATAR_URL,
    );

    const filteredUrls = urls.filter(
      (url) => url !== defaultAvatarURL && url !== defaultEventAvatarURL,
    );

    return Promise.all(
      filteredUrls.map((url) => {
        const publicId = url.split('/').pop()?.split('.')[0];
        return this.deleteImage(publicId as string);
      }),
    );
  }
}
