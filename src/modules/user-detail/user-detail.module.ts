import { Module } from '@nestjs/common';
import { UserDetailService } from './user-detail.service';
import { UserDetailController } from './user-detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDetail } from 'src/core/database/entity/userDetail.entity';

@Module({
  controllers: [UserDetailController],
  imports: [TypeOrmModule.forFeature([UserDetail])],
  providers: [UserDetailService],
  exports: [UserDetailService],
})
export class UserDetailModule {}
