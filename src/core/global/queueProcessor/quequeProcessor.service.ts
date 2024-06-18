import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import Bull, { Queue } from 'bull';
import {
  QUEUE_MODULE_OPTIONS,
  TJobName,
  TQueueName,
} from './queueIdentity.constant';
import { ErrorMessage } from '@core/enum';

@Injectable()
export class QueueProcessorService {
  constructor(
    @InjectQueue(QUEUE_MODULE_OPTIONS.SEND_MAIL_TEMPLE_CREATE_EVENT.NAME)
    private readonly sendMailTempleUpdateEventQueue: Queue,
  ) {}
  private logger: Logger = new Logger('QueueProcessorService');

  async handleAddQueue(
    queueName: TQueueName,
    jobName: TJobName,
    data: unknown,
    opts?: Bull.JobOptions,
  ) {
    const queue = this.findQueue(queueName);
    if (!queue) {
      this.logger.log(`${ErrorMessage.CAN_NOTE_FIND_QUEUE}: ${queueName}`);
      return;
    }

    await queue.add(jobName, data, opts);
  }

  async handlePauseQueue(queueName: TQueueName) {
    const queue = this.findQueue(queueName);

    if (!queue) {
      this.logger.log(`${ErrorMessage.CAN_NOTE_FIND_QUEUE}: ${queueName}`);
      return;
    }

    await queue.pause();
  }

  async handleResumeQueue(queueName: TQueueName) {
    const queue = this.findQueue(queueName);

    if (!queue) {
      this.logger.log(`${ErrorMessage.CAN_NOTE_FIND_QUEUE}: ${queueName}`);
      return;
    }

    await queue.resume();
  }

  findQueue(queueName: TQueueName): Queue | null {
    let queue = null;

    switch (queueName) {
      case QUEUE_MODULE_OPTIONS.SEND_MAIL_TEMPLE_CREATE_EVENT.NAME:
        queue = this.sendMailTempleUpdateEventQueue;
        break;

      default:
        break;
    }

    return queue;
  }
}
