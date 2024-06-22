import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Family } from 'src/core/database/entity/family.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UserModule } from '../user/user.module';
import { FamilyController } from './family.controller';
import { FamilyResolver } from './family.resolver';
import { FamilyService } from './family.service';

@Module({
  imports: [TypeOrmModule.forFeature([Family]), CloudinaryModule, UserModule],
  controllers: [FamilyController],
  providers: [FamilyService, FamilyResolver],
  exports: [FamilyService],
})
export class FamilyModule {}
