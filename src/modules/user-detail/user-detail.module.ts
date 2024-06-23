import { Module } from '@nestjs/common';
import { UserDetailService } from './user-detail.service';
import { UserDetailController } from './user-detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDetail } from 'src/core/database/entity/userDetail.entity';
import { UserDetailResolver } from './user-detail.resolver';
import { CloudinaryModule } from '@modules/cloudinary/cloudinary.module';

@Module({
  controllers: [UserDetailController],
  imports: [TypeOrmModule.forFeature([UserDetail]), CloudinaryModule],
  providers: [UserDetailService, UserDetailResolver],
  exports: [UserDetailService],
})
export class UserDetailModule {}
