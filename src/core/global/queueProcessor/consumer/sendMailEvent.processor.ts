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
import { FooterMail, sendMail } from '@helper/mailtrap';
import * as format from 'string-format';
import { ConfigService } from '@nestjs/config';
import { EConfiguration } from '@core/config';
import * as dayjs from 'dayjs';
import { FormatDate } from '@core/constants/formatDate';
import { NotificationService } from '@modules/notification/notification.service';
import { Notifications } from '@core/constants';
import { EventParticipantService } from '@modules/event-participant/event-participant.service';

@Processor(QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.NAME)
export class SendMailEventConsumer {
  private readonly logger = new Logger(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.NAME,
  );

  constructor(
    private readonly templeService: TempleService,
    private readonly notificationService: NotificationService,
    private readonly eventParticipantService: EventParticipantService,
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

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.JOBS.SEND_CREATE_EVENT_MAIL)
  async handleSendMailTempleCreateEvent(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const temple = await this.templeService.getTempleAndTempleFollowers(
      job.data.templeId,
    );

    const mailFormat = getMailFormat(EMailType.CREATE_EVENT);

    return await Promise.allSettled(
      temple.followerTemples.map(async (follower) => {
        await this.notificationService.createNotification({
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
              ? 'Điện thoại: ' + job.data.eventPhone
              : '',
            eventEmail: job.data.eventEmail
              ? 'Email: ' + job.data.eventEmail
              : '',
            footer: FooterMail.footer,
          }),
        });
      }),
    );
  }

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.JOBS.SEND_UPDATE_EVENT_MAIL)
  async handleSendMailTempleUpdateEvent(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const temple = await this.templeService.getTempleAndTempleFollowers(
      job.data.templeId,
    );

    const mailFormat = getMailFormat(EMailType.UPDATE_EVENT);

    const eventParticipant =
      await this.eventParticipantService.getBookingAndApproveEventParticipants(
        job.data.eventId,
      );

    await Promise.allSettled(
      eventParticipant.map(async (participant) => {
        await this.notificationService.createNotification({
          userId: participant.userId,
          title: Notifications.updateEvent.title(temple.name),
          description: Notifications.updateEvent.description(
            temple.name,
            job.data.eventName,
          ),
          redirectTo: Notifications.updateEvent.redirectTo(job.data.eventId),
          type: ENotificationType.UPDATE_EVENT,
        });

        return await sendMail({
          to: participant.user.email,
          title: format(mailFormat.title, {
            templeName: temple.name,
          }),
          content: format(mailFormat.content, {
            templeName: temple.name,
            userName: participant.user.userDetail.name,
            eventAddress: job.data.eventAddress,
            eventName: job.data.eventName,
            eventDetailUrl:
              this.configService.get(EConfiguration.CLIENT_URL) +
              '/event/' +
              job.data.eventId,
            eventPhone: job.data.eventPhone
              ? 'Điện thoại: ' + job.data.eventPhone
              : '',
            eventEmail: job.data.eventEmail
              ? 'Email: ' + job.data.eventEmail
              : '',
            footer: FooterMail.footer,
          }),
        });
      }),
    );

    const unBookingFollower = temple.followerTemples.filter(
      (follower) =>
        !eventParticipant.some(
          (participant) => participant.userId === follower.user.id,
        ),
    );

    return await Promise.allSettled(
      unBookingFollower.map(async (follower) => {
        await this.notificationService.createNotification({
          userId: follower.user.id,
          title: Notifications.updateEvent.title(temple.name),
          description: Notifications.updateEvent.description(
            temple.name,
            job.data.eventName,
          ),
          redirectTo: Notifications.updateEvent.redirectTo(job.data.eventId),
          type: ENotificationType.UPDATE_EVENT,
        });

        return await sendMail({
          to: follower.user.email,
          title: format(mailFormat.title, {
            templeName: temple.name,
          }),
          content: format(mailFormat.content, {
            templeName: temple.name,
            userName: follower.user.userDetail.name,
            eventName: job.data.eventName,
            eventDetailUrl:
              this.configService.get(EConfiguration.CLIENT_URL) +
              '/event/' +
              job.data.eventId,
            eventPhone: job.data.eventPhone
              ? 'Điện thoại: ' + job.data.eventPhone
              : '',
            eventEmail: job.data.eventEmail
              ? 'Email: ' + job.data.eventEmail
              : '',
            footer: FooterMail.footer,
          }),
        });
      }),
    );
  }

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.JOBS.SEND_CANCEL_EVENT_MAIL)
  async handleSendMailTempleCancelEvent(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const temple = await this.templeService.getTempleAndTempleFollowers(
      job.data.templeId,
    );

    const mailFormat = getMailFormat(EMailType.CANCEL_EVENT);

    const eventParticipant =
      await this.eventParticipantService.getBookingAndApproveEventParticipants(
        job.data.eventId,
      );

    await Promise.allSettled(
      eventParticipant.map(async (participant) => {
        await this.notificationService.createNotification({
          userId: participant.userId,
          title: Notifications.cancelEvent.title(temple.name),
          description: Notifications.cancelEvent.description(
            temple.name,
            job.data.eventName,
          ),
          type: ENotificationType.CANCEL_EVENT,
        });

        return await sendMail({
          to: participant.user.email,
          title: format(mailFormat.title, {
            templeName: temple.name,
          }),
          content: format(mailFormat.content, {
            templeName: temple.name,
            userName: participant.user.userDetail.name,
            eventName: job.data.eventName,
            eventPhone: job.data.eventPhone
              ? 'Điện thoại: ' + job.data.eventPhone
              : '',
            eventEmail: job.data.eventEmail
              ? 'Email: ' + job.data.eventEmail
              : '',
            footer: FooterMail.footer,
          }),
        });
      }),
    );

    const unBookingFollower = temple.followerTemples.filter(
      (follower) =>
        !eventParticipant.some(
          (participant) => participant.userId === follower.user.id,
        ),
    );

    return await Promise.allSettled(
      unBookingFollower.map(async (follower) => {
        await this.notificationService.createNotification({
          userId: follower.user.id,
          title: Notifications.cancelEvent.title(temple.name),
          description: Notifications.cancelEvent.description(
            temple.name,
            job.data.eventName,
          ),
          type: ENotificationType.CANCEL_EVENT,
        });

        return await sendMail({
          to: follower.user.email,
          title: format(mailFormat.title, {
            templeName: temple.name,
          }),
          content: format(mailFormat.content, {
            templeName: temple.name,
            userName: follower.user.userDetail.name,
            eventName: job.data.eventName,
            eventPhone: job.data.eventPhone
              ? 'Điện thoại: ' + job.data.eventPhone
              : '',
            eventEmail: job.data.eventEmail
              ? 'Email: ' + job.data.eventEmail
              : '',
            footer: FooterMail.footer,
          }),
        });
      }),
    );
  }
}
