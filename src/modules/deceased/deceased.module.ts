import { UserDetailModule } from './../user-detail/user-detail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';
import { DeceasedService } from './deceased.service';
import { DeceasedController } from './deceased.controller';
import { Deceased } from 'src/core/database/entity/deceased.entity';
import { ImageModule } from '../image/image.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { FamilyTempleModule } from '@modules/family-temple/family-temple.module';
import { DeceasedResolver } from './deceased.resolver';
import { DeathAnniversaryModule } from '@modules/death-anniversary/death-anniversary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deceased]),
    UserDetailModule,
    CloudinaryModule,
    ImageModule,
    FamilyTempleModule,
    forwardRef(() => DeathAnniversaryModule),
  ],
  controllers: [DeceasedController],
  providers: [DeceasedService, DeceasedResolver],
  exports: [DeceasedService],
})
export class DeceasedModule {}
