import { Notifications } from '@core/constants';
import { EMailType, ENotificationType } from '@core/enum';
import { FooterMail, sendMail } from '@helper/mailtrap';
import { delay, getMailFormat } from '@helper/utils';
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
import { DeceasedService } from '@modules/deceased/deceased.service';

@Processor(QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.NAME)
export class SendMailDeathAnniversaryConsumer {
  private readonly logger = new Logger(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.NAME,
  );

  constructor(
    private readonly templeService: TempleService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    private readonly deathAnniversaryService: DeathAnniversaryService,
    private readonly deceasedService: DeceasedService,
    private readonly configService: ConfigService,
  ) {}

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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
        if (user.id === job.data.creatorId) return;
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
            footer: FooterMail.footer,
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
            footer: FooterMail.footer,
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
            footer: FooterMail.footer,
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
            footer: FooterMail.footer,
          }),
        });
      }),
    );
  }

  @Process(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
      .TEMPLE_READY_DEATH_ANNIVERSARY,
  )
  async handleTempleReadyDeathAnniversary(job: Job) {
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

    const mailFormat = getMailFormat(EMailType.READY_DEATH_ANNIVERSARY);

    await Promise.allSettled(
      templeMembers.map(async (user) => {
        if (user.id !== job.data.approverId) {
          await this.notificationService.createNotification({
            userId: user.id,
            title: Notifications.readyDeathAnniversary.title,
            description: Notifications.readyDeathAnniversary.description(
              deathAnniversary.deceased.userDetail.name,
            ),
            redirectTo: Notifications.readyDeathAnniversary.redirectTo,
            type: ENotificationType.READY_DEATH_ANNIVERSARY,
          });
        }
        return true;
      }),
    );

    return await Promise.allSettled(
      familyMembers.map(async (user) => {
        await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.readyDeathAnniversary.title,
          description: Notifications.readyDeathAnniversary.description(
            deathAnniversary.deceased.userDetail.name,
          ),
          redirectTo: Notifications.readyDeathAnniversary.redirectTo,
          type: ENotificationType.READY_DEATH_ANNIVERSARY,
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
            footer: FooterMail.footer,
          }),
        });
      }),
    );
  }

  @Process(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
      .TEMPLE_FINISH_DEATH_ANNIVERSARY,
  )
  async handleTempleFinishDeathAnniversary(job: Job) {
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

    const mailFormat = getMailFormat(EMailType.FINISH_DEATH_ANNIVERSARY);

    await Promise.allSettled(
      templeMembers.map(async (user) => {
        if (user.id !== job.data.approverId) {
          await this.notificationService.createNotification({
            userId: user.id,
            title: Notifications.finishDeathAnniversary.title,
            description: Notifications.finishDeathAnniversary.description(
              deathAnniversary.deceased.userDetail.name,
            ),
            redirectTo: Notifications.finishDeathAnniversary.redirectTo,
            type: ENotificationType.FINISH_DEATH_ANNIVERSARY,
          });
        }
        return true;
      }),
    );

    return await Promise.allSettled(
      familyMembers.map(async (user) => {
        await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.finishDeathAnniversary.title,
          description: Notifications.finishDeathAnniversary.description(
            deathAnniversary.deceased.userDetail.name,
          ),
          redirectTo: Notifications.finishDeathAnniversary.redirectTo,
          type: ENotificationType.FINISH_DEATH_ANNIVERSARY,
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
            footer: FooterMail.footer,
          }),
        });
      }),
    );
  }

  @Process(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
      .NOTIFICATION_DEATH_ANNIVERSARY_COMING,
  )
  async handleSendMailDeathAnniversaryComing(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const dateOfDeathNext7DaysDeceaseds =
      await this.deceasedService.getDeathAnniversaryNextDayDeceaseds(7);

    this.logger.log(
      `********dateOfDeathNext7DaysDeceaseds: ${JSON.stringify(
        dateOfDeathNext7DaysDeceaseds,
      )}`,
    );

    const dateOfDeathNext3DaysDeceaseds =
      await this.deceasedService.getDeathAnniversaryNextDayDeceaseds(3);

    this.logger.log(
      `********dateOfDeathNext3DaysDeceaseds: ${JSON.stringify(
        dateOfDeathNext3DaysDeceaseds,
      )}`,
    );

    const dateOfDeathTodayDeceaseds =
      await this.deceasedService.getDeathAnniversaryNextDayDeceaseds();

    const mailFormat = getMailFormat(
      EMailType.DEATH_ANNIVERSARY_COMING_AFTER_DAYS,
    );

    const mailFormatToday = getMailFormat(EMailType.DEATH_ANNIVERSARY_TODAY);

    await Promise.allSettled(
      dateOfDeathNext7DaysDeceaseds.map(async (deceased) => {
        return await Promise.allSettled(
          deceased.family.users.map(async (user) => {
            await this.notificationService.createNotification({
              userId: user.id,
              title: Notifications.deathAnniversaryComingAfterDays.title,
              description:
                Notifications.deathAnniversaryComingAfterDays.description(
                  deceased.userDetail.name,
                  7,
                ),
              redirectTo:
                Notifications.deathAnniversaryComingAfterDays.redirectTo(
                  deceased.id,
                ),
              type: ENotificationType.DEATH_ANNIVERSARY_COMING_AFTER_DAYS,
            });
            await delay(1000);
            return await sendMail({
              to: user.email,
              title: mailFormat.title,
              content: format(mailFormat.content, {
                userName: user.userDetail.name,
                deceasedName: deceased.userDetail.name,
                days: 7,
                requestDeathAnniversaryUrl:
                  this.configService.get(EConfiguration.CLIENT_URL) +
                  `/deceased/${deceased.id}`,
                footer: FooterMail.footer,
              }),
            });
          }),
        );
      }),
    );

    await Promise.allSettled(
      dateOfDeathNext3DaysDeceaseds.map(async (deceased) => {
        return await Promise.allSettled(
          deceased.family.users.map(async (user) => {
            await this.notificationService.createNotification({
              userId: user.id,
              title: Notifications.deathAnniversaryComingAfterDays.title,
              description:
                Notifications.deathAnniversaryComingAfterDays.description(
                  deceased.userDetail.name,
                  3,
                ),
              redirectTo:
                Notifications.deathAnniversaryComingAfterDays.redirectTo(
                  deceased.id,
                ),
              type: ENotificationType.DEATH_ANNIVERSARY_COMING_AFTER_DAYS,
            });
            await delay(1000);
            return await sendMail({
              to: user.email,
              title: mailFormat.title,
              content: format(mailFormat.content, {
                userName: user.userDetail.name,
                deceasedName: deceased.userDetail.name,
                days: 3,
                requestDeathAnniversaryUrl:
                  this.configService.get(EConfiguration.CLIENT_URL) +
                  `/deceased/${deceased.id}`,
                footer: FooterMail.footer,
              }),
            });
          }),
        );
      }),
    );

    return await Promise.allSettled(
      dateOfDeathTodayDeceaseds.map(async (deceased) => {
        return await Promise.allSettled(
          deceased.family.users.map(async (user) => {
            await this.notificationService.createNotification({
              userId: user.id,
              title: Notifications.deathAnniversaryToday.title,
              description: Notifications.deathAnniversaryToday.description(
                deceased.userDetail.name,
              ),
              redirectTo: Notifications.deathAnniversaryToday.redirectTo(
                deceased.id,
              ),
              type: ENotificationType.DEATH_ANNIVERSARY_TODAY,
            });
            await delay(1000);
            return await sendMail({
              to: user.email,
              title: mailFormatToday.title,
              content: format(mailFormatToday.content, {
                userName: user.userDetail.name,
                deceasedName: deceased.userDetail.name,
                deceasedUrl:
                  this.configService.get(EConfiguration.CLIENT_URL) +
                  `/deceased/${deceased.id}`,
                footer: FooterMail.footer,
              }),
            });
          }),
        );
      }),
    );
  }

  @Process(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
      .FAMILY_UPDATE_REJECTED_DEATH_ANNIVERSARY,
  )
  async handleFamilyUpdateRejectedDeathAnniversary(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const familyMembers = await this.userService.getFamilyMembersByFamilyId(
      job.data.familyId,
    );

    const templeMembers = await this.userService.getTempleMembersByTempleId(
      job.data.templeId,
    );

    const mailFormat = getMailFormat(
      EMailType.FAMILY_UPDATE_REJECTED_DEATH_ANNIVERSARY,
    );

    await Promise.allSettled(
      templeMembers.map(async (user) => {
        await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.familyUpdateRejectedDeathAnniversary.title,
          description:
            Notifications.familyUpdateRejectedDeathAnniversary.description(
              job.data.updaterName,
              job.data.deceasedName,
            ),
          redirectTo:
            Notifications.familyUpdateRejectedDeathAnniversary.redirectTo,
          type: ENotificationType.FAMILY_UPDATE_REJECTED_DEATH_ANNIVERSARY,
        });

        return await sendMail({
          to: user.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: user.userDetail.name,
            updaterName: job.data.updaterName,
            deceasedName: job.data.deceasedName,
            deathAnniversaryUrl:
              this.configService.get(EConfiguration.CLIENT_URL) +
              '/death-anniversary',
            footer: FooterMail.footer,
          }),
        });
      }),
    );

    return await Promise.allSettled(
      familyMembers.map(async (user) => {
        if (user.id === job.data.updaterId) return;
        await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.familyUpdateRejectedDeathAnniversary.title,
          description:
            Notifications.familyUpdateRejectedDeathAnniversary.description(
              job.data.updaterName,
              job.data.deceasedName,
            ),
          redirectTo:
            Notifications.familyUpdateRejectedDeathAnniversary.redirectTo,
          type: ENotificationType.FAMILY_UPDATE_REJECTED_DEATH_ANNIVERSARY,
        });
        return await sendMail({
          to: user.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: user.userDetail.name,
            updaterName: job.data.updaterName,
            deceasedName: job.data.deceasedName,
            deathAnniversaryUrl:
              this.configService.get(EConfiguration.CLIENT_URL) +
              '/death-anniversary',
            footer: FooterMail.footer,
          }),
        });
      }),
    );
  }

  @Process(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_DEATH_ANNIVERSARY.JOBS
      .FAMILY_CANCEL_DEATH_ANNIVERSARY,
  )
  async handleFamilyCancelDeathAnniversary(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const familyMembers = await this.userService.getFamilyMembersByFamilyId(
      job.data.familyId,
    );

    const templeMembers = await this.userService.getTempleMembersByTempleId(
      job.data.templeId,
    );

    const mailFormat = getMailFormat(EMailType.FAMILY_CANCEL_DEATH_ANNIVERSARY);

    await Promise.allSettled(
      templeMembers.map(async (user) => {
        await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.familyCancelDeathAnniversary.title,
          description: Notifications.familyCancelDeathAnniversary.description(
            job.data.cancelerName,
            job.data.deceasedName,
          ),
          redirectTo: Notifications.familyCancelDeathAnniversary.redirectTo,
          type: ENotificationType.FAMILY_CANCEL_DEATH_ANNIVERSARY,
        });

        return await sendMail({
          to: user.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: user.userDetail.name,
            cancelerName: job.data.cancelerName,
            deceasedName: job.data.deceasedName,
            deathAnniversaryUrl:
              this.configService.get(EConfiguration.CLIENT_URL) +
              '/death-anniversary',
            footer: FooterMail.footer,
          }),
        });
      }),
    );

    return await Promise.allSettled(
      familyMembers.map(async (user) => {
        if (user.id === job.data.updaterId) return;
        await this.notificationService.createNotification({
          userId: user.id,
          title: Notifications.familyCancelDeathAnniversary.title,
          description: Notifications.familyCancelDeathAnniversary.description(
            job.data.cancelerName,
            job.data.deceasedName,
          ),
          redirectTo: Notifications.familyCancelDeathAnniversary.redirectTo,
          type: ENotificationType.FAMILY_CANCEL_DEATH_ANNIVERSARY,
        });
        return await sendMail({
          to: user.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: user.userDetail.name,
            cancelerName: job.data.cancelerName,
            deceasedName: job.data.deceasedName,
            deathAnniversaryUrl:
              this.configService.get(EConfiguration.CLIENT_URL) +
              '/death-anniversary',
            footer: FooterMail.footer,
          }),
        });
      }),
    );
  }
}
