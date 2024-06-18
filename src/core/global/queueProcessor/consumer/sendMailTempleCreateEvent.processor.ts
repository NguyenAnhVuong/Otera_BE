import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_MODULE_OPTIONS } from '../queueIdentity.constant';
import { getMailFormat } from '@helper/utils';
import { EMailType, ENotificationType } from '@core/enum';
import { TempleService } from '@modules/temple/temple.service';
import { sendMail } from '@helper/mailtrap';
import * as format from 'string-format';
import { ConfigService } from '@nestjs/config';
import { EConfiguration } from '@core/config';
import * as dayjs from 'dayjs';
import { FormatDate } from '@core/constants/formatDate';
import { NotificationService } from '@modules/notification/notification.service';
import { Notifications } from '@core/constants';

@Processor(QUEUE_MODULE_OPTIONS.SEND_MAIL_TEMPLE_CREATE_EVENT.NAME)
export class SendMailTempleCreateEventConsumer {
  private readonly logger = new Logger(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_TEMPLE_CREATE_EVENT.NAME,
  );

  constructor(
    private readonly templeService: TempleService,
    private readonly notification: NotificationService,
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

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_TEMPLE_CREATE_EVENT.JOBS.SEND_MAIL)
  async handleAutoCompleteAnniversary(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const temple = await this.templeService.getTempleAndTempleFollowers(
      job.data.templeId,
    );

    const mailFormat = getMailFormat(EMailType.CREATE_EVENT);

    return await Promise.allSettled(
      temple.followerTemples.map(async (follower) => {
        await this.notification.createNotification({
          userId: follower.user.id,
          title: Notifications.newEvent.title(temple.name),
          description: Notifications.newEvent.description(
            temple.name,
            job.data.eventName,
          ),
          redirectTo: Notifications.newEvent.redirectTo(job.data.eventId),
          type: ENotificationType.NEW_EVENT,
        });

        return await sendMail({
          to: follower.user.email,
          title: format(mailFormat.title, {
            templeName: temple.name,
          }),
          content: format(mailFormat.content, {
            templeName: temple.name,
            userName: follower.user.userDetail.name,
            startDateEvent: dayjs(job.data.startDateEvent).format(
              FormatDate.HH_mm_DD_MM_YYYY,
            ),
            eventAddress: job.data.eventAddress,
            eventName: job.data.eventName,
            eventDetailUrl:
              this.configService.get(EConfiguration.CLIENT_URL) +
              '/event/' +
              job.data.eventId,
            eventPhone: job.data.eventPhone
              ? 'Điện thoại: ' + job.data.event.phone
              : '',
            eventEmail: job.data.email ? 'Email: ' + job.data.email : '',
          }),
        });
      }),
    );
  }
}
