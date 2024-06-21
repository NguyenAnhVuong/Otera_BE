import { Notifications } from '@core/constants';
import { ENotificationType } from '@core/enum';
import { NotificationService } from '@modules/notification/notification.service';
import { UserService } from '@modules/user/user.service';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { QUEUE_MODULE_OPTIONS } from '../queueIdentity.constant';

@Processor(QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME)
export class SendMailDeceasedConsumer {
  private readonly logger = new Logger(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME,
  );

  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,

    private readonly configService: ConfigService,
  ) {}

  @OnQueueActive()
  onQueueActive(job: Job) {
    this.logger.log(`********OnQueueActive Job: ${job.name}`);
  }

  @OnQueueCompleted()
  onQueueCompleted(job: Job) {
    this.logger.log(`********OnQueueCompleted Job: ${job.name}`);
  }

  @OnQueueFailed()
  onQueueFailed(job: Job, err: Error) {
    this.logger.log(`********OnQueueFailed Job: ${job.name}`, err);
  }

  @Process(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.CONTRIBUTE_DECEASED_IMAGE,
  )
  async handleSendContributeDeceasedImageNotification(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const familyMembers = await this.userService.getFamilyMembersByFamilyId(
      job.data.familyId,
    );

    await Promise.allSettled(
      familyMembers.map(async (familyMember) => {
        if (familyMember.id === job.data.userId) return;
        return await this.notificationService.createNotification({
          userId: familyMember.id,
          title: Notifications.contributeImage.title,
          description: Notifications.contributeImage.description(
            job.data.userName,
            job.data.deceasedName,
          ),
          redirectTo: Notifications.contributeImage.redirectTo(
            job.data.deceasedId,
          ),
          type: ENotificationType.CONTRIBUTE_DECEASED_IMAGE,
        });
      }),
    );
  }
}
