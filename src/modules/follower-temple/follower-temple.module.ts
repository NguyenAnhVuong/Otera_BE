import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { TempleModule } from '@modules/temple/temple.module';
import { FollowerTemple } from '@core/database/entity/followerTemple.entity';
import { FollowerTempleResolver } from './follower-temple.resolver';
import { FollowerTempleService } from './follower-temple.service';

@Module({
  imports: [TypeOrmModule.forFeature([FollowerTemple]), TempleModule],
  providers: [FollowerTempleResolver, FollowerTempleService],
})
export class FollowerTempleModule {}
