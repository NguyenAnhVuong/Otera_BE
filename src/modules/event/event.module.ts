import { Module, forwardRef } from '@nestjs/common';
import { EventService } from './event.service';
import { EventResolver } from './event.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '@core/database/entity/event.entity';
import { EventParticipantTypeModule } from '@modules/event-participant-type/event-participant-type.module';
import { ImageModule } from '@modules/image/image.module';
import { EventParticipantModule } from '@modules/event-participant/event-participant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    EventParticipantTypeModule,
    ImageModule,

    forwardRef(() => EventParticipantModule),
  ],
  providers: [EventResolver, EventService],
  exports: [EventService],
})
export class EventModule {}
