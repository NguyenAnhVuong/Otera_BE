import { Module } from '@nestjs/common';
import { DeathAnniversaryService } from './death-anniversary.service';
import { DeathAnniversaryResolver } from './death-anniversary.resolver';
import { DeceasedModule } from '@modules/deceased/deceased.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeathAnniversary } from '@core/database/entity/deathAnniversary.entity';
import { TempleModule } from '@modules/temple/temple.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeathAnniversary]),
    DeceasedModule,
    TempleModule,
  ],
  providers: [DeathAnniversaryResolver, DeathAnniversaryService],
})
export class DeathAnniversaryModule {}
