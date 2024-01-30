import { Module } from '@nestjs/common';
import { DeathAnniversaryService } from './death-anniversary.service';
import { DeathAnniversaryResolver } from './death-anniversary.resolver';
import { DeceasedModule } from '@modules/deceased/deceased.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeathAnniversary } from '@core/database/entity/deathAnniversary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeathAnniversary]), DeceasedModule],
  providers: [DeathAnniversaryResolver, DeathAnniversaryService],
})
export class DeathAnniversaryModule {}
