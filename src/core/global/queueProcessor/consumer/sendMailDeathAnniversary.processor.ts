import { Notifications } from '@core/constants';
import { EMailType, ENotificationType } from '@core/enum';
import { sendMail } from '@helper/mailtrap';
import { getMailFormat } from '@helper/utils';
import { NotificationService } from '@modules/notification/notification.service';
import { TempleService } from '@modules/temple/temple.service';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as format from 'string-format';
import { QUEUE_MODULE_OPTIONS } from '../queueIdentity.constant';
import { ConfigService } from '@nestjs/config';
import { EConfiguration } from '@core/config';

@Processor(QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.NAME)
export class SendMailDeathAnniversaryConsumer {
  private readonly logger = new Logger(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.NAME,
  );

  constructor(
    private readonly templeService: TempleService,
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
    QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
      .SEND_REQUEST_DEATH_ANNIVERSARY,
  )
  async handleSendMailRequestDeathAnniversary(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const temple = await this.templeService.getTempleAndTempleMembers(
      job.data.templeId,
    );

    const mailFormat = getMailFormat(EMailType.REQUEST_DEATH_ANNIVERSARY);

    return await Promise.allSettled(
      temple.users.map(async (user) => {
        await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.requestDeathAnniversary.title,
          description: Notifications.requestDeathAnniversary.description(
            job.data.deceasedName,
          ),
          redirectTo: Notifications.requestDeathAnniversary.redirectTo,
          type: ENotificationType.REQUEST_DEATH_ANNIVERSARY,
        });

        return await sendMail({
          to: user.email,
          title: format(mailFormat.title, {
            templeName: temple.name,
          }),
          content: format(mailFormat.content, {
            requesterName: job.data.requesterName,
            userName: user.userDetail.name,
            deceasedName: job.data.deceasedName,
            deathAnniversaryUrl:
              this.configService.get(EConfiguration.CLIENT_URL) +
              '/death-anniversary',
          }),
        });
      }),
    );
  }
}
