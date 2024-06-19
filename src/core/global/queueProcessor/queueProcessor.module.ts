import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TempleModule } from '@modules/temple/temple.module';
import { QueueProcessorService } from './quequeProcessor.service';
import { NotificationModule } from '@modules/notification/notification.module';
import { SendMailEventConsumer } from './consumer/sendMailEvent.processor';
import { EventParticipantModule } from '@modules/event-participant/event-participant.module';
import { QUEUE_MODULE_OPTIONS } from './queueIdentity.constant';
import { SendMailDeathAnniversaryConsumer } from './consumer/sendMailDeathAnniversary.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.NAME,
      },
      {
        name: QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.NAME,
      },
    ),
    TempleModule,
    NotificationModule,
    EventParticipantModule,
  ],
  providers: [
    SendMailEventConsumer,
    SendMailDeathAnniversaryConsumer,
    QueueProcessorService,
  ],
  exports: [QueueProcessorService],
})
export class QueueProcessorModule {}
