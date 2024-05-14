import { Module } from '@nestjs/common';
import { UserDetailService } from './user-detail.service';
import { UserDetailController } from './user-detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDetail } from 'src/core/database/entity/userDetail.entity';
import { UserDetailResolver } from './user-detail.resolver';

@Module({
  controllers: [UserDetailController],
  imports: [TypeOrmModule.forFeature([UserDetail])],
  providers: [UserDetailService, UserDetailResolver],
  exports: [UserDetailService],
})
export class UserDetailModule {}
