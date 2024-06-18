import { Global, Module } from '@nestjs/common';
import { SendMailTempleCreateEventConsumer } from './consumer/sendMailTempleCreateEvent.processor';
import { BullModule } from '@nestjs/bull';
import { TempleModule } from '@modules/temple/temple.module';
import { QueueProcessorService } from './quequeProcessor.service';
import { NotificationModule } from '@modules/notification/notification.module';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'SendMailTempleCreateEvent',
    }),
    TempleModule,
    NotificationModule,
  ],
  providers: [SendMailTempleCreateEventConsumer, QueueProcessorService],
  exports: [QueueProcessorService],
})
export class QueueProcessorModule {}
