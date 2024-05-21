import { InviteFamily } from '@core/database/entity/inviteFamily.entity';
import { ENotificationType, ERole, EStatus, ErrorMessage } from '@core/enum';
import { UserService } from '@modules/user/user.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  MoreThan,
  Repository,
  UpdateResult,
} from 'typeorm';
import { InviteFamilyInput } from './dto/invite-family.input';
import { NotificationService } from '@modules/notification/notification.service';
import { ResponseInviteFamilyInput } from './dto/response-invite-family.input';
import { IUserData } from '@core/interface/default.interface';
import { Notifications } from '@core/constants';
import { FamilyService } from '@modules/family/family.service';

@Injectable()
export class InviteFamilyService {
  constructor(
    @InjectRepository(InviteFamily)
    private readonly inviteFamilyRepository: Repository<InviteFamily>,

    private readonly userService: UserService,

    private readonly notificationService: NotificationService,

    private readonly familyService: FamilyService,

    private readonly dataSource: DataSource,
  ) {}

  async inviteToFamily(
    userData: IUserData,
    inviteFamilyInput: InviteFamilyInput,
  ) {
    const { fid: familyId, name } = userData;
    const { email } = inviteFamilyInput;

    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new HttpException(
        ErrorMessage.ACCOUNT_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.familyId) {
      throw new HttpException(
        ErrorMessage.USER_ALREADY_IN_FAMILY,
        HttpStatus.BAD_REQUEST,
      );
    }

    const family = await this.familyService.getFamilyById({ id: familyId });

    if (!family) {
      throw new HttpException(
        ErrorMessage.FAMILY_NOT_EXIST,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.dataSource.transaction(async (entityManager: EntityManager) => {
      // 30 days
      const newExpiredAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const inviteFamilyRepository = entityManager.getRepository(InviteFamily);

      const inviteFamily = await inviteFamilyRepository.findOne({
        where: {
          familyId,
          userId: user.id,
          isDeleted: false,
          expiredAt: MoreThan(new Date()),
        },
      });

      if (inviteFamily) {
        await inviteFamilyRepository.update(
          { id: inviteFamily.id },
          {
            expiredAt: newExpiredAt,
          },
        );

        const notification =
          await this.notificationService.getNotificationByUserIdAndInviteFamilyId(
            user.id,
            inviteFamily.id,
            entityManager,
          );

        await this.notificationService.updateNotification(
          { id: notification.id, createdAt: new Date() },
          user.id,
          entityManager,
        );
      }

      await inviteFamilyRepository.save({
        familyId,
        userId: user.id,
        expiredAt: newExpiredAt,
      });

      await this.notificationService.createNotification(
        {
          userId: user.id,
          title: Notifications.inviteFamily.title,
          description: Notifications.inviteFamily.description(
            name,
            family.name,
          ),
          type: ENotificationType.INVITE_FAMILY,
          inviteFamilyId: familyId,
        },
        entityManager,
      );
    });
    return true;
  }

  async getInviteFamilyById(id: number): Promise<InviteFamily> {
    return await this.inviteFamilyRepository.findOne({
      where: {
        id,
      },
    });
  }

  async responseFamilyInvitation(
    userId: number,
    responseInviteFamilyInput: ResponseInviteFamilyInput,
  ): Promise<UpdateResult> {
    return await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        const inviteFamilyRepository =
          entityManager.getRepository(InviteFamily);
        const { id, status, notificationId } = responseInviteFamilyInput;
        const inviteFamily = await inviteFamilyRepository.findOne({
          where: {
            id,
            userId,
            isDeleted: false,
            status: EStatus.PENDING,
          },
        });

        if (!inviteFamily) {
          throw new HttpException(
            ErrorMessage.INVITATION_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }

        await this.notificationService.updateNotification(
          {
            id: notificationId,
            isRead: true,
            isDeleted: true,
          },
          userId,
          entityManager,
        );

        if (inviteFamily.expiredAt < new Date()) {
          throw new HttpException(
            ErrorMessage.INVITATION_EXPIRED,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (status === EStatus.APPROVED) {
          await this.userService.updateUserById(
            userId,
            {
              familyId: inviteFamily.familyId,
              role: ERole.FAMILY_MEMBER,
            },
            entityManager,
          );
        }

        return await inviteFamilyRepository.update(inviteFamily.id, {
          status,
        });
      },
    );
  }
}
