import { Module } from '@nestjs/common';
import { FamilyTempleService } from './family-temple.service';
import { FamilyTempleController } from './family-temple.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyTemple } from 'src/core/database/entity/familyTemple.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyTemple])],
  controllers: [FamilyTempleController],
  providers: [FamilyTempleService],
  exports: [FamilyTempleService],
})
export class FamilyTempleModule {}
