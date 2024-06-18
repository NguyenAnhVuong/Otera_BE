import { Notification } from '@core/database/entity/notification.entity';
import { ErrorMessage } from '@core/enum';
import { IUserData } from '@core/interface/default.interface';
import { returnPagingData } from '@helper/utils';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { GetNotificationsArgs } from './dto/get-notifications.args';
import { UpdateNotificationInput } from './dto/update-notification.input';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(
    notification: DeepPartial<Notification>,
    entityManager?: EntityManager,
  ) {
    const notificationRepository = entityManager
      ? entityManager.getRepository(Notification)
      : this.notificationRepository;
    return await notificationRepository.save(notification);
  }

  async getNotifications(
    userData: IUserData,
    getNotificationsArgs: GetNotificationsArgs,
  ) {
    const { id } = userData;

    const { skip, take } = getNotificationsArgs;

    const [data, count] = await this.notificationRepository.findAndCount({
      where: [
        {
          userId: id,
        },
      ],
      order: {
        createdAt: 'DESC',
      },
      skip,
      take,
    });

    return returnPagingData(data, count, getNotificationsArgs);
  }

  async updateNotification(
    updateNotificationInput: UpdateNotificationInput,
    userId: number,
    entityManager?: EntityManager,
  ) {
    const notificationRepository = entityManager
      ? entityManager.getRepository(Notification)
      : this.notificationRepository;

    const { id, isRead, isDeleted, createdAt } = updateNotificationInput;

    const notification = await notificationRepository.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new HttpException(
        ErrorMessage.NOTIFICATION_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await notificationRepository.update(
      {
        id,
        userId,
      },
      {
        ...(isRead && { isRead }),
        ...(isDeleted && { isDeleted }),
        ...(createdAt && { createdAt }),
      },
    );
  }

  async getNotificationByUserIdAndInviteFamilyId(
    userId: number,
    inviteFamilyId: number,
    entityManager?: EntityManager,
  ) {
    const notificationRepository = entityManager
      ? entityManager.getRepository(Notification)
      : this.notificationRepository;

    return await notificationRepository.findOne({
      where: {
        userId,
        inviteFamilyId,
        isDeleted: false,
      },
    });
  }
}
