import { Module } from '@nestjs/common';
import { OfferingService } from './offering.service';
import { OfferingResolver } from './offering.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offering } from '@core/database/entity/offering.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Offering])],
  providers: [OfferingResolver, OfferingService],
})
export class OfferingModule {}
