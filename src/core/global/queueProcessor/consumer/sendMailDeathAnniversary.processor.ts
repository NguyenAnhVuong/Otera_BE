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
import { UserService } from '@modules/user/user.service';
import { DeathAnniversaryService } from '@modules/death-anniversary/death-anniversary.service';

@Processor(QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.NAME)
export class SendMailDeathAnniversaryConsumer {
  private readonly logger = new Logger(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_EVENT.NAME,
  );

  constructor(
    private readonly templeService: TempleService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    private readonly deathAnniversaryService: DeathAnniversaryService,
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

    const familyMembers = await this.userService.getFamilyMembersByFamilyId(
      job.data.familyId,
    );

    await Promise.allSettled(
      familyMembers.map(async (user) => {
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

  @Process(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
      .TEMPLE_APPROVE_DEATH_ANNIVERSARY,
  )
  async handleTempleApproveDeathAnniversary(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const deathAnniversary =
      await this.deathAnniversaryService.getDeathAnniversaryById(
        job.data.deathAnniversaryId,
      );

    const familyMembers = await this.userService.getFamilyMembersByFamilyId(
      deathAnniversary.familyId,
    );

    const templeMembers = await this.userService.getTempleMembersByTempleId(
      deathAnniversary.templeId,
    );

    const mailFormat = getMailFormat(EMailType.APPROVE_DEATH_ANNIVERSARY);

    await Promise.allSettled(
      templeMembers.map(async (user) => {
        if (user.id !== job.data.approverId) {
          await this.notificationService.createNotification({
            userId: user.id,
            title: Notifications.approveDeathAnniversary.title,
            description: Notifications.approveDeathAnniversary.description(
              deathAnniversary.deceased.userDetail.name,
            ),
            redirectTo: Notifications.approveDeathAnniversary.redirectTo,
            type: ENotificationType.APPROVE_DEATH_ANNIVERSARY,
          });
        }
        return true;
      }),
    );

    return await Promise.allSettled(
      familyMembers.map(async (user) => {
        await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.approveDeathAnniversary.title,
          description: Notifications.approveDeathAnniversary.description(
            deathAnniversary.deceased.userDetail.name,
          ),
          redirectTo: Notifications.approveDeathAnniversary.redirectTo,
          type: ENotificationType.APPROVE_DEATH_ANNIVERSARY,
        });

        return await sendMail({
          to: user.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: user.userDetail.name,
            deceasedName: deathAnniversary.deceased.userDetail.name,
            deathAnniversaryUrl:
              this.configService.get(EConfiguration.CLIENT_URL) +
              '/death-anniversary',
          }),
        });
      }),
    );
  }

  @Process(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
      .TEMPLE_REJECT_DEATH_ANNIVERSARY,
  )
  async handleTempleRejectDeathAnniversary(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const deathAnniversary =
      await this.deathAnniversaryService.getDeathAnniversaryById(
        job.data.deathAnniversaryId,
      );

    const familyMembers = await this.userService.getFamilyMembersByFamilyId(
      deathAnniversary.familyId,
    );

    const templeMembers = await this.userService.getTempleMembersByTempleId(
      deathAnniversary.templeId,
    );

    const mailFormat = getMailFormat(EMailType.REJECT_DEATH_ANNIVERSARY);

    await Promise.allSettled(
      templeMembers.map(async (user) => {
        if (user.id !== job.data.approverId) {
          await this.notificationService.createNotification({
            userId: user.id,
            title: Notifications.approveDeathAnniversary.title,
            description: Notifications.approveDeathAnniversary.description(
              deathAnniversary.deceased.userDetail.name,
            ),
            redirectTo: Notifications.approveDeathAnniversary.redirectTo,
            type: ENotificationType.APPROVE_DEATH_ANNIVERSARY,
          });
        }
        return true;
      }),
    );

    return await Promise.allSettled(
      familyMembers.map(async (user) => {
        await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.rejectBookingEvent.title,
          description: Notifications.rejectBookingEvent.description(
            deathAnniversary.deceased.userDetail.name,
          ),
          redirectTo: Notifications.rejectBookingEvent.redirectTo(
            deathAnniversary.id,
          ),
          type: ENotificationType.REJECT_DEATH_ANNIVERSARY,
        });

        return await sendMail({
          to: user.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: user.userDetail.name,
            deceasedName: deathAnniversary.deceased.userDetail.name,
            deathAnniversaryUrl:
              this.configService.get(EConfiguration.CLIENT_URL) +
              '/death-anniversary',
          }),
        });
      }),
    );
  }
}
