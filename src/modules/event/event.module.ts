import { Event } from '@core/database/entity/event.entity';
import { EventParticipantTypeModule } from '@modules/event-participant-type/event-participant-type.module';
import { EventParticipantModule } from '@modules/event-participant/event-participant.module';
import { ImageModule } from '@modules/image/image.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventResolver } from './event.resolver';
import { EventService } from './event.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    EventParticipantTypeModule,
    ImageModule,
    forwardRef(() => EventParticipantModule),
    NotificationModule,
  ],
  providers: [EventResolver, EventService],
  exports: [EventService],
})
export class EventModule {}
