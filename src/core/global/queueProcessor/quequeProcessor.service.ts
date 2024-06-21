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
    @InjectQueue(QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.NAME)
    private readonly sendMailTempleUpdateEventQueue: Queue,

    @InjectQueue(QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.NAME)
    private readonly sendMailDeathAnniversaryQueue: Queue,

    @InjectQueue(QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME)
    private readonly sendMailDeceasedQueue: Queue,
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
      case QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.NAME:
        queue = this.sendMailTempleUpdateEventQueue;
        break;

      case QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.NAME:
        queue = this.sendMailDeathAnniversaryQueue;
        break;

      case QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME:
        queue = this.sendMailDeceasedQueue;

      default:
        break;
    }

    return queue;
  }
}
