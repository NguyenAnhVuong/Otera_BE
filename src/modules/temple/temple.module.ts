import { Module } from '@nestjs/common';
import { TempleService } from './temple.service';
import { TempleController } from './temple.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Temple } from 'src/core/database/entity/temple.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ImageModule } from '../image/image.module';
import { UserModule } from '../user/user.module';
import { TempleResolver } from './temple.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Temple]),
    CloudinaryModule,
    ImageModule,
    UserModule,
  ],
  controllers: [TempleController],
  providers: [TempleService, TempleResolver],
  exports: [TempleService],
})
export class TempleModule {}
