import { DeathAnniversaryModule } from '@modules/death-anniversary/death-anniversary.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deceased } from 'src/core/database/entity/deceased.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ImageModule } from '../image/image.module';
import { UserDetailModule } from './../user-detail/user-detail.module';
import { DeceasedController } from './deceased.controller';
import { DeceasedResolver } from './deceased.resolver';
import { DeceasedService } from './deceased.service';
import { TempleModule } from '@modules/temple/temple.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deceased]),
    UserDetailModule,
    CloudinaryModule,
    ImageModule,
    forwardRef(() => DeathAnniversaryModule),
    TempleModule,
  ],
  controllers: [DeceasedController],
  providers: [DeceasedService, DeceasedResolver],
  exports: [DeceasedService],
})
export class DeceasedModule {}
