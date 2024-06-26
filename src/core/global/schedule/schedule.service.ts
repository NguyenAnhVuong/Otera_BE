import { Injectable, Logger } from '@nestjs/common';
import { CronJob, CronTime } from 'cron';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CRON_JOB_NAME } from './schedule.constant';
import { QueueProcessorService } from '../queueProcessor/quequeProcessor.service';
import { QUEUE_MODULE_OPTIONS } from '../queueProcessor/queueIdentity.constant';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger('ScheduleService');
  constructor(
    private schedulerRegistry: SchedulerRegistry, // private queueProcessorService: QueueProcessorService,
    private queueProcessorService: QueueProcessorService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM, {
    name: CRON_JOB_NAME.NOTIFICATION_DEATH_ANNIVERSARY_COMING,
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleCronjobNotificationDeathAnniversary() {
    this.logger.log(
      '********Start CronJob: ',
      CRON_JOB_NAME.NOTIFICATION_DEATH_ANNIVERSARY_COMING,
    );
    await this.queueProcessorService.handleAddQueue(
      QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.NAME,
      QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
        .NOTIFICATION_DEATH_ANNIVERSARY_COMING,
      null,
    );

    this.schedulerRegistry
      .getCronJob(CRON_JOB_NAME.NOTIFICATION_DEATH_ANNIVERSARY_COMING)
      .stop();
  }

  getCronJobs() {
    return this.schedulerRegistry.getCronJobs();
  }

  getCronJob(name: string) {
    return this.schedulerRegistry.getCronJob(name);
  }

  deleteCronJob(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
  }

  stopCronJob(job: CronJob) {
    job.stop();
  }

  deleteCronJobs(cronNames: string[]) {
    try {
      for (const cronName of cronNames) {
        const cronJob = this.schedulerRegistry.getCronJob(cronName);

        if (cronJob) {
          this.stopCronJob(cronJob);
          this.deleteCronJob(cronName);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  restartCronJob(job: CronJob) {
    job.start();
  }

  setTimeCronJob(job: CronJob, time: CronTime) {
    job.setTime(time);
  }

  getLastDateCronJob(job: CronJob) {
    return job.lastDate();
  }

  getNextDateCronJob(job: CronJob, count?: number) {
    count = count || 10;
    return job.nextDates(count);
  }
}
