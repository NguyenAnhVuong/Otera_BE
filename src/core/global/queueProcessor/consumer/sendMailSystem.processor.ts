import { EConfiguration } from '@core/config';
import { Notifications } from '@core/constants';
import { EMailType, ENotificationType } from '@core/enum';
import { FooterMail, sendMail } from '@helper/mailtrap';
import { getMailFormat } from '@helper/utils';
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
import * as format from 'string-format';
import { QUEUE_MODULE_OPTIONS } from '../queueIdentity.constant';

@Processor(QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.NAME)
export class SendMailSystemConsumer {
  private readonly logger = new Logger(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.NAME,
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

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.JOBS.REGISTER_TEMPLE)
  async handleSendMailRegisterTemple(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const systemUsers = await this.userService.getSystemUsers();

    const mailFormat = getMailFormat(EMailType.TEMPLE_REGISTER);

    return await Promise.allSettled(
      systemUsers.map(async (user) => {
        await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.registerTemple.title,
          description: Notifications.registerTemple.description(
            job.data.creatorName,
            job.data.templeName,
          ),
          type: ENotificationType.TEMPLE_REGISTER,
        });

        return await sendMail({
          to: user.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: user.userDetail.name,
            creatorName: job.data.creatorName,
            templeName: job.data.templeName,
            templeManagementUrl:
              this.configService.get<string>(EConfiguration.CLIENT_URL) +
              '/system/temple',
            footer: FooterMail.footer,
          }),
        });
      }),
    );
  }

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.JOBS.APPROVE_TEMPLE)
  async handleSendMailApproveTemple(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const systemUsers = await this.userService.getSystemUsers();

    const mailFormat = getMailFormat(EMailType.APPROVE_TEMPLE);

    return await Promise.allSettled(
      systemUsers.map(async (user) => {
        if (user.id === job.data.userId) return;
        await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.approveTemple.title,
          description: Notifications.approveTemple.description(
            job.data.templeName,
          ),
          redirectTo: Notifications.approveTemple.redirectTo(job.data.templeId),
          type: ENotificationType.APPROVE_TEMPLE,
        });

        return await sendMail({
          to: user.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: user.userDetail.name,
            templeName: job.data.templeName,
            templeManagementUrl:
              this.configService.get<string>(EConfiguration.CLIENT_URL) +
              `/temple/${job.data.templeId}`,
            footer: FooterMail.footer,
          }),
        });
      }),
    );
  }

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.JOBS.REJECT_TEMPLE)
  async handleSendMailRejectTemple(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const systemUsers = await this.userService.getSystemUsers();

    return await Promise.allSettled(
      systemUsers.map(async (user) => {
        if (user.id === job.data.userId) return;
        return await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.rejectTemple.title,
          description: Notifications.rejectTemple.description(
            job.data.templeName,
          ),
          redirectTo: Notifications.rejectTemple.redirectTo,
          type: ENotificationType.REJECT_TEMPLE,
        });
      }),
    );
  }

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.JOBS.BLOCK_TEMPLE)
  async handleSendMailBlockTemple(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const systemUsers = await this.userService.getSystemUsers();

    const templeMembers = await this.userService.getTempleMembersByTempleId(
      job.data.templeId,
    );

    const mailFormat = getMailFormat(EMailType.BLOCK_TEMPLE);

    await Promise.allSettled(
      systemUsers.map(async (user) => {
        if (user.id === job.data.userId) return;
        return await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.blockTemple.title,
          description: Notifications.blockTemple.description(
            job.data.templeName,
          ),
          redirectTo: Notifications.blockTemple.redirectTo,
          type: ENotificationType.BLOCK_TEMPLE,
        });
      }),
    );

    return await Promise.allSettled(
      templeMembers.map(async (user) => {
        await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.blockTemple.title,
          description: Notifications.blockTemple.description(
            job.data.templeName,
          ),
          type: ENotificationType.BLOCK_TEMPLE,
        });
        return await sendMail({
          to: user.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: user.userDetail.name,
            templeName: job.data.templeName,
            blockReason: job.data.blockReason,
            footer: FooterMail.footer,
          }),
        });
      }),
    );
  }
}
