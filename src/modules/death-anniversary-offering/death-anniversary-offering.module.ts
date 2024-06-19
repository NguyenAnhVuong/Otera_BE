import { Module } from '@nestjs/common';
import { DeathAnniversaryOfferingService } from './death-anniversary-offering.service';
import { DeathAnniversaryOfferingResolver } from './death-anniversary-offering.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeathAnniversaryOffering } from '@core/database/entity/deathAnniversaryOffering.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeathAnniversaryOffering])],
  providers: [
    DeathAnniversaryOfferingResolver,
    DeathAnniversaryOfferingService,
  ],
  exports: [DeathAnniversaryOfferingService],
})
export class DeathAnniversaryOfferingModule {}
