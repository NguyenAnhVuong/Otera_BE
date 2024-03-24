import { Module } from '@nestjs/common';
import { EventParticipantTypeService } from './event-participant-type.service';
import { EventParticipantTypeResolver } from './event-participant-type.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventParticipantType } from '@core/database/entity/eventParticipantType.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventParticipantType])],
  providers: [EventParticipantTypeResolver, EventParticipantTypeService],
  exports: [EventParticipantTypeService],
})
export class EventParticipantTypeModule {}
