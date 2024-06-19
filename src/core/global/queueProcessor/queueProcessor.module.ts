import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TempleModule } from '@modules/temple/temple.module';
import { QueueProcessorService } from './quequeProcessor.service';
import { NotificationModule } from '@modules/notification/notification.module';
import { SendMailEventConsumer } from './consumer/sendMailEvent.processor';
import { EventParticipantModule } from '@modules/event-participant/event-participant.module';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'SendMailTempleCreateEvent',
    }),
    TempleModule,
    NotificationModule,
    EventParticipantModule,
  ],
  providers: [SendMailEventConsumer, QueueProcessorService],
  exports: [QueueProcessorService],
})
export class QueueProcessorModule {}
