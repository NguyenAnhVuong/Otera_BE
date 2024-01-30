import { UserDetailModule } from './../user-detail/user-detail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DeceasedService } from './deceased.service';
import { DeceasedController } from './deceased.controller';
import { Deceased } from 'src/core/database/entity/deceased.entity';
import { ImageModule } from '../image/image.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { FamilyTempleModule } from '@modules/family-temple/family-temple.module';
import { DeceasedResolver } from './deceased.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deceased]),
    UserDetailModule,
    CloudinaryModule,
    ImageModule,
    FamilyTempleModule,
  ],
  controllers: [DeceasedController],
  providers: [DeceasedService, DeceasedResolver],
})
export class DeceasedModule {}
