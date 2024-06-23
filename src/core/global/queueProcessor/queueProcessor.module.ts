import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TempleModule } from '@modules/temple/temple.module';
import { QueueProcessorService } from './quequeProcessor.service';
import { NotificationModule } from '@modules/notification/notification.module';
import { SendMailEventConsumer } from './consumer/sendMailEvent.processor';
import { EventParticipantModule } from '@modules/event-participant/event-participant.module';
import { QUEUE_MODULE_OPTIONS } from './queueIdentity.constant';
import { SendMailDeathAnniversaryConsumer } from './consumer/sendMailDeathAnniversary.processor';
import { UserModule } from '@modules/user/user.module';
import { DeathAnniversaryModule } from '@modules/death-anniversary/death-anniversary.module';
import { SendMailDeceasedConsumer } from './consumer/sendMailDeceased.processor';
import { DeceasedModule } from '@modules/deceased/deceased.module';
import { SendMailSystemConsumer } from './consumer/sendMailSystem.processor';

// TODO Send mail when invite member to family and reminder when approaching the anniversary

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
      {
        name: QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME,
      },
      {
        name: QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.NAME,
      },
    ),
    TempleModule,
    NotificationModule,
    EventParticipantModule,
    UserModule,
    DeathAnniversaryModule,
    DeceasedModule,
  ],
  providers: [
    SendMailEventConsumer,
    SendMailDeathAnniversaryConsumer,
    SendMailDeceasedConsumer,
    QueueProcessorService,
    SendMailSystemConsumer,
  ],
  exports: [QueueProcessorService],
})
export class QueueProcessorModule {}
