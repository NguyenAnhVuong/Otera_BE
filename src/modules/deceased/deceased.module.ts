import { UserDetailModule } from './../user-detail/user-detail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DeceasedService } from './deceased.service';
import { DeceasedController } from './deceased.controller';
import { Deceased } from 'src/core/database/entity/deceased.entity';
import { ImageModule } from '../image/image.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deceased]),
    UserDetailModule,
    CloudinaryModule,
    ImageModule,
  ],
  controllers: [DeceasedController],
  providers: [DeceasedService],
})
export class DeceasedModule {}
