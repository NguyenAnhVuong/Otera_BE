import { Module } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Family } from 'src/core/database/entity/family.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UserModule } from '../user/user.module';
import { FamilyTempleModule } from '../family-temple/family-temple.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Family]),
    CloudinaryModule,
    UserModule,
    FamilyTempleModule,
  ],
  controllers: [FamilyController],
  providers: [FamilyService],
})
export class FamilyModule {}
