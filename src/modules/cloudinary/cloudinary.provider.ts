import { v2 } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.constants';
import { ConfigService } from '@nestjs/config';
import { EConfiguration } from 'src/core/config';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: async (configService: ConfigService) => {
    return v2.config({
      cloud_name: configService.get(EConfiguration.CLOUDINARY_CLOUD_NAME),
      api_key: configService.get(EConfiguration.CLOUDINARY_API_KEY),
      api_secret: configService.get(EConfiguration.CLOUDINARY_API_SECRET),
    });
  },
  inject: [ConfigService],
};
