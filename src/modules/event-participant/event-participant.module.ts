import { Module, forwardRef } from '@nestjs/common';
import { EventParticipantService } from './event-participant.service';
import { EventParticipantResolver } from './event-participant.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventParticipant } from '@core/database/entity/eventParticipant.entity';
import { EventModule } from '@modules/event/event.module';
import { UserModule } from '@modules/user/user.module';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventParticipant]),
    forwardRef(() => EventModule),
    UserModule,
    NotificationModule,
  ],
  providers: [EventParticipantResolver, EventParticipantService],
  exports: [EventParticipantService],
})
export class EventParticipantModule {}
