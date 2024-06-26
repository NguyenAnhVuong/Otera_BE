import { Notifications } from '@core/constants';
import { EMailType, ENotificationType } from '@core/enum';
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
import { getMailFormat } from '@helper/utils';
import { sendMail } from '@helper/mailtrap';
import * as format from 'string-format';
import { DeceasedService } from '@modules/deceased/deceased.service';
import { EConfiguration } from '@core/config';

@Processor(QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME)
export class SendMailDeceasedConsumer {
  private readonly logger = new Logger(
    QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME,
  );

  constructor(
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly deceasedService: DeceasedService,
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

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.DECLARE_DECEASED)
  async handleSendMailDeclareDeceased(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const templeMembers = await this.userService.getTempleMembersByTempleId(
      job.data.templeId,
    );

    const mailFormat = getMailFormat(EMailType.DECLARE_DECEASED);

    return await Promise.allSettled(
      templeMembers.map(async (templeMember) => {
        await this.notificationService.createNotification({
          userId: templeMember.id,
          title: Notifications.declareDeceased.title,
          description: Notifications.declareDeceased.description(
            job.data.userName,
            job.data.deceasedName,
          ),
          redirectTo: Notifications.declareDeceased.redirectTo,
          type: ENotificationType.DECLARE_DECEASED,
        });
        return await sendMail({
          to: templeMember.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: templeMember.userDetail.name,
            deceasedName: job.data.deceasedName,
            deceasedUrl:
              this.configService.get(EConfiguration.CLIENT_URL) +
              `/temple/deceased`,
          }),
        });
      }),
    );
  }

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.UPDATE_DECEASED)
  async handleSendUpdateDeceasedImageNotification(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const familyMembers = await this.userService.getFamilyMembersByFamilyId(
      job.data.familyId,
    );

    await Promise.allSettled(
      familyMembers.map(async (familyMember) => {
        if (familyMember.id === job.data.userId) return;
        return await this.notificationService.createNotification({
          userId: familyMember.id,
          title: Notifications.updateDeceased.title,
          description: Notifications.updateDeceased.description(
            job.data.userName,
            job.data.deceasedName,
          ),
          redirectTo: Notifications.updateDeceased.redirectTo(
            job.data.deceasedId,
          ),
          type: ENotificationType.UPDATE_DECEASED,
        });
      }),
    );
  }

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.APPROVE_DECEASED)
  async handleSendApproveDeceasedImageNotification(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const deceased = await this.deceasedService.getPendingDeceasedById(
      job.data.deceasedId,
    );

    const familyMembers = await this.userService.getFamilyMembersByFamilyId(
      deceased.familyId,
    );

    const templeMembers = await this.userService.getTempleMembersByTempleId(
      deceased.templeId,
    );

    const mailFormat = getMailFormat(EMailType.APPROVE_DECEASED);

    await Promise.allSettled(
      templeMembers.map(async (templeMember) => {
        if (templeMember.id === job.data.userId) return;
        return await this.notificationService.createNotification({
          userId: templeMember.id,
          title: Notifications.approveDeceased.title,
          description: Notifications.approveDeceased.description(
            deceased.userDetail.name,
          ),
          redirectTo: Notifications.approveDeceased.redirectTo(
            job.data.deceasedId,
          ),
          type: ENotificationType.APPROVE_DECEASED,
        });
      }),
    );

    await Promise.allSettled(
      familyMembers.map(async (familyMember) => {
        await this.notificationService.createNotification({
          userId: familyMember.id,
          title: Notifications.approveDeceased.title,
          description: Notifications.approveDeceased.description(
            deceased.userDetail.name,
          ),
          redirectTo: Notifications.approveDeceased.redirectTo(
            job.data.deceasedId,
          ),
          type: ENotificationType.APPROVE_DECEASED,
        });

        return await sendMail({
          to: familyMember.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: familyMember.userDetail.name,
            deceasedName: deceased.userDetail.name,
            deceasedUrl:
              this.configService.get(EConfiguration.CLIENT_URL) +
              `/deceased/${job.data.deceasedId}`,
          }),
        });
      }),
    );
  }

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.REJECT_DECEASED)
  async handleSendRejectDeceasedImageNotification(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const deceased = await this.deceasedService.getPendingDeceasedById(
      job.data.deceasedId,
    );

    const creator = await this.userService.getUserById(deceased.creatorId);

    const templeMembers = await this.userService.getTempleMembersByTempleId(
      deceased.templeId,
    );

    const mailFormat = getMailFormat(EMailType.REJECT_DECEASED);

    await Promise.allSettled(
      templeMembers.map(async (templeMember) => {
        if (templeMember.id === job.data.userId) return;
        return await this.notificationService.createNotification({
          userId: templeMember.id,
          title: Notifications.rejectDeceased.title,
          description: Notifications.rejectDeceased.description(
            deceased.userDetail.name,
          ),
          redirectTo: Notifications.rejectDeceased.redirectTo,
          type: ENotificationType.REJECT_DECEASED,
        });
      }),
    );

    await this.notificationService.createNotification({
      userId: creator.id,
      title: Notifications.rejectDeceased.title,
      description: Notifications.rejectDeceased.description(
        deceased.userDetail.name,
      ),
      type: ENotificationType.REJECT_DECEASED,
    });

    await sendMail({
      to: creator.email,
      title: mailFormat.title,
      content: format(mailFormat.content, {
        userName: creator.userDetail.name,
        deceasedName: deceased.userDetail.name,
        rejectReason: job.data.rejectReason,
      }),
    });
  }

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.DELETE_DECEASED)
  async handleSendDeleteDeceasedImageNotification(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const deceased = await this.deceasedService.getPendingDeceasedById(
      job.data.deceasedId,
    );

    const familyMembers = await this.userService.getFamilyMembersByFamilyId(
      deceased.familyId,
    );

    const templeMembers = await this.userService.getTempleMembersByTempleId(
      deceased.templeId,
    );

    const mailFormat = getMailFormat(EMailType.DELETE_DECEASED);

    await Promise.allSettled(
      templeMembers.map(async (templeMember) => {
        if (templeMember.id === job.data.userId) return;
        return await this.notificationService.createNotification({
          userId: templeMember.id,
          title: Notifications.deleteDeceased.title,
          description: Notifications.deleteDeceased.description(
            job.data.userName,
            deceased.userDetail.name,
          ),
          redirectTo: Notifications.deleteDeceased.redirectTo,
          type: ENotificationType.DELETE_DECEASED,
        });
      }),
    );

    await Promise.allSettled(
      familyMembers.map(async (familyMember) => {
        if (familyMember.id === job.data.userId) return;
        await this.notificationService.createNotification({
          userId: familyMember.id,
          title: Notifications.deleteDeceased.title,
          description: Notifications.deleteDeceased.description(
            job.data.userName,
            deceased.userDetail.name,
          ),
          type: ENotificationType.DELETE_DECEASED,
        });

        return await sendMail({
          to: familyMember.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            deleterName: job.data.userName,
            userName: familyMember.userDetail.name,
            deceasedName: deceased.userDetail.name,
          }),
        });
      }),
    );
  }

  @Process(QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.RESTORE_DECEASED)
  async handleSendRestoreDeceasedImageNotification(job: Job) {
    this.logger.log(`********OnQueueConsumer Job: ${JSON.stringify(job)}`);

    const familyMembers = await this.userService.getFamilyMembersByFamilyId(
      job.data.familyId,
    );

    const templeMembers = await this.userService.getTempleMembersByTempleId(
      job.data.templeId,
    );

    const mailFormat = getMailFormat(EMailType.RESTORE_DECEASED);

    await Promise.allSettled(
      templeMembers.map(async (templeMember) => {
        if (templeMember.id === job.data.userId) return;
        return await this.notificationService.createNotification({
          userId: templeMember.id,
          title: Notifications.restoreDeceased.title,
          description: Notifications.restoreDeceased.description(
            job.data.userName,
            job.data.deceasedName,
          ),
          redirectTo: Notifications.restoreDeceased.redirectTo(
            job.data.deceasedId,
          ),
          type: ENotificationType.RESTORE_DECEASED,
        });
      }),
    );

    await Promise.allSettled(
      familyMembers.map(async (familyMember) => {
        if (familyMember.id === job.data.userId) return;
        await this.notificationService.createNotification({
          userId: familyMember.id,
          title: Notifications.restoreDeceased.title,
          description: Notifications.restoreDeceased.description(
            job.data.userName,
            job.data.deceasedName,
          ),
          type: ENotificationType.RESTORE_DECEASED,
        });

        return await sendMail({
          to: familyMember.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: familyMember.userDetail.name,
            restorerName: job.data.userName,
            deceasedName: job.data.deceasedName,
            deceasedUrl:
              this.configService.get(EConfiguration.CLIENT_URL) +
              `/deceased/${job.data.deceasedId}`,
          }),
        });
      }),
    );
  }
}
