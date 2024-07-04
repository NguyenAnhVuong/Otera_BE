import { EConfiguration } from '@core/config';
import { Notifications } from '@core/constants';
import { User } from '@core/database/entity/user.entity';
import { ErrorMessage } from '@core/enum';
import { QueueProcessorService } from '@core/global/queueProcessor/quequeProcessor.service';
import { QUEUE_MODULE_OPTIONS } from '@core/global/queueProcessor/queueIdentity.constant';
import { IUserData } from '@core/interface/default.interface';
import { FooterMail, sendMail } from '@helper/mailtrap';
import { NotificationService } from '@modules/notification/notification.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/core/database/entity/image.entity';
import { Temple } from 'src/core/database/entity/temple.entity';
import {
  EMailType,
  ENotificationType,
  ERole,
  EStatus,
} from 'src/core/enum/default.enum';
import { getMailFormat, returnPagingData } from 'src/helper/utils';
import * as format from 'string-format';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserService } from '../user/user.service';
import { ImageService } from './../image/image.service';
import { VCreateTempleDto } from './dto/create-temple.dto';
import { VGetTempleMembersArgs } from './dto/get-temple-members.args';
import { VGetTemplesDto } from './dto/get-temples.dto';
import { VRemoveTempleMemberInput } from './dto/remove-temple-member.input';
import { VSystemGetTemplesDto } from './dto/system-get-temples.input';
import { VUpdateStatusTempleInput } from './dto/update-status-temple.input';
import { VUpdateTempleInput } from './dto/update-temple-input';

@Injectable()
export class TempleService {
  constructor(
    @InjectRepository(Temple)
    private readonly templeRepository: Repository<Temple>,

    private readonly cloudinaryService: CloudinaryService,

    private readonly imageService: ImageService,

    private readonly userService: UserService,

    private readonly notificationService: NotificationService,

    private readonly queueProcessorService: QueueProcessorService,

    private readonly configService: ConfigService,

    private readonly dataSource: DataSource,
  ) {}

  async createTemple(
    userData: IUserData,
    templeParams: VCreateTempleDto,
    avatar: Express.Multer.File,
    images?: Express.Multer.File[],
  ): Promise<Temple> {
    const { id: adminId, name: userName } = userData;
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const temple = await this.templeRepository.findOne({
        where: { adminId, status: EStatus.PENDING },
      });

      if (temple) {
        throw new HttpException(
          ErrorMessage.TEMPLE_REGISTER_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }

      const templeRepository = manager.getRepository(Temple);
      const uploadedAvatar = await this.cloudinaryService.uploadImage(avatar);
      const newTemple = await templeRepository.save({
        ...templeParams,
        name: templeParams.name.replace('Chùa', '').replace('chùa', '').trim(),
        avatar: uploadedAvatar.url,
        adminId,
      });

      if (images && images.length > 0) {
        const uploadedImages = await this.cloudinaryService.uploadImages(
          images,
        );
        const imagesUrl: DeepPartial<Image>[] = uploadedImages.map((image) => {
          return { image: image.url, templeId: newTemple.id };
        });
        await this.imageService.createImages(imagesUrl, manager);
      }

      await this.notificationService.createNotification(
        {
          title: Notifications.registerTemplesSent.title,
          description: Notifications.registerTemplesSent.description(
            newTemple.name,
          ),
          type: ENotificationType.TEMPLE_REGISTER_SENT,
        },
        manager,
      );

      await this.queueProcessorService.handleAddQueue(
        QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.NAME,
        QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.JOBS.REGISTER_TEMPLE,
        {
          creatorName: userName,
          templeName: templeParams.name,
        },
      );

      return newTemple;
    });
  }

  async getTempleById(id: number): Promise<Temple> {
    return await this.templeRepository.findOne({
      where: { id, status: EStatus.APPROVED },
      relations: ['images'],
    });
  }

  async getTempleDetail(id: number, userData?: IUserData): Promise<Temple> {
    const query = this.templeRepository
      .createQueryBuilder('temple')
      .where('temple.id = :id', { id })
      .leftJoinAndSelect('temple.images', 'images')
      .leftJoinAndSelect(
        'temple.followerTemples',
        'followerTemples',
        'followerTemples.userId = :userId',
        {
          ...(userData ? { userId: userData.id } : { userId: -1 }),
        },
      );

    if (userData && userData.role !== ERole.SYSTEM) {
      query.andWhere('temple.status = :status', { status: EStatus.APPROVED });
    }

    return await query.getOne();
  }

  async getTempleByAdminId(adminId: number): Promise<Temple> {
    const temple = await this.templeRepository.findOne({
      where: { adminId },
    });

    if (!temple) {
      throw new HttpException(
        ErrorMessage.TEMPLE_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    return temple;
  }

  async getTemples(getTemplesDto: VGetTemplesDto) {
    const { skip, take, keyword } = getTemplesDto;
    const query = this.templeRepository
      .createQueryBuilder('temple')
      .where({
        status: EStatus.APPROVED,
      })
      .skip(skip)
      .take(take)
      // .orderBy('temple.priority', 'DESC')
      .orderBy('temple.createdAt', 'DESC');

    if (keyword) {
      query.andWhere(
        '(temple.name ILIKE :keyword OR temple.address ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    const [items, totalItems] = await query.getManyAndCount();

    return returnPagingData(items, totalItems, getTemplesDto);
  }

  async systemGetTemples(systemGetTemplesQuery: VSystemGetTemplesDto) {
    const { name, email, address, orderBy, status, skip, take } =
      systemGetTemplesQuery;
    const query = this.templeRepository
      .createQueryBuilder('temple')
      .leftJoinAndSelect('temple.images', 'images')
      .leftJoinAndMapOne(
        'temple.admin',
        User,
        'admin',
        'temple.adminId = admin.id',
      )
      .leftJoinAndSelect('admin.userDetail', 'userDetail')
      .skip(skip)
      .take(take);
    if (name) {
      query.andWhere('temple.name ILIKE :name', { name: `%${name}%` });
    }

    if (email) {
      query.andWhere('temple.email ILIKE :email', { email: `%${email}%` });
    }

    if (address) {
      query.andWhere('temple.address ILIKE :address', {
        address: `%${address}%`,
      });
    }

    if (status) {
      query.andWhere('temple.status = :status', { status });
    }

    if (orderBy) {
      orderBy.forEach((order) => {
        query.addOrderBy(`temple.${order.column}`, order.sortOrder);
      });
    }

    const [data, count] = await query.getManyAndCount();

    return returnPagingData(data, count, systemGetTemplesQuery);
  }

  async updateStatusTemple(
    updateStatusTemple: VUpdateStatusTempleInput,
    userData: IUserData,
  ) {
    const { id, status, rejectReason, blockReason } = updateStatusTemple;
    const temple = await this.templeRepository.findOne({
      where: { id },
    });

    if (!temple) {
      throw new HttpException(
        ErrorMessage.TEMPLE_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const user = await this.userService.getUserById(temple.adminId);

      if (!user) {
        throw new HttpException(
          ErrorMessage.ACCOUNT_NOT_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (status === EStatus.APPROVED) {
        await this.userService.updateUserById(
          temple.adminId,
          {
            templeId: temple.id,
            role: ERole.TEMPLE_ADMIN,
            passwordChangedAt: new Date(),
          },
          manager,
        );
        await this.queueProcessorService.handleAddQueue(
          QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.NAME,
          QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.JOBS.APPROVE_TEMPLE,
          {
            userId: userData.id,
            templeId: temple.id,
            templeName: temple.name,
          },
        );

        await this.notificationService.createNotification(
          {
            userId: temple.adminId,
            title: Notifications.approveTempleUser.title,
            description: Notifications.approveTempleUser.description(
              temple.name,
            ),
            redirectTo: Notifications.approveTempleUser.redirectTo(temple.id),
            type: ENotificationType.APPROVE_TEMPLE,
          },
          manager,
        );

        const mailFormat = getMailFormat(EMailType.APPROVE_TEMPLE);

        await sendMail({
          to: user.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: user.userDetail.name,
            templeName: temple.name,
            templeDetailUrl:
              this.configService.get<string>(EConfiguration.CLIENT_URL) +
              `/temple/${temple.id}`,
            footer: FooterMail.footer,
          }),
        });
      } else if (status === EStatus.REJECTED) {
        await this.queueProcessorService.handleAddQueue(
          QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.NAME,
          QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.JOBS.REJECT_TEMPLE,
          {
            userId: userData.id,
            templeName: temple.name,
          },
        );

        await this.notificationService.createNotification(
          {
            userId: temple.adminId,
            title: Notifications.rejectTemple.title,
            description: Notifications.rejectTemple.description(temple.name),
            type: ENotificationType.REJECT_TEMPLE,
          },
          manager,
        );

        const mailFormat = getMailFormat(EMailType.REJECT_TEMPLE);

        await sendMail({
          to: user.email,
          title: mailFormat.title,
          content: format(mailFormat.content, {
            userName: user.userDetail.name,
            templeName: temple.name,
            rejectReason,
            footer: FooterMail.footer,
          }),
        });
      } else if (status === EStatus.BLOCKED) {
        await this.userService.updateUserByTempleId(
          temple.id,
          {
            role: ERole.PUBLIC_USER,
            passwordChangedAt: new Date(),
          },
          manager,
        );

        await this.queueProcessorService.handleAddQueue(
          QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.NAME,
          QUEUE_MODULE_OPTIONS.SEND_MAIL_SYSTEM.JOBS.BLOCK_TEMPLE,
          {
            userId: userData.id,
            templeId: temple.id,
            templeName: temple.name,
            blockReason,
          },
        );
      }

      return await this.templeRepository.update(id, {
        status,
        rejectReason,
        blockReason,
      });
    });
  }

  async addTempleMember(templeId: number, email: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new HttpException(
        ErrorMessage.ACCOUNT_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.role !== ERole.PUBLIC_USER) {
      throw new HttpException(
        ErrorMessage.INVALID_PARAM,
        HttpStatus.BAD_REQUEST,
      );
    }

    const temple = await this.templeRepository.findOne({
      where: { id: templeId },
    });

    await this.notificationService.createNotification({
      userId: user.id,
      title: Notifications.addTempleMember.title,
      description: Notifications.addTempleMember.description(temple.name),
      type: ENotificationType.ADD_TEMPLE_MEMBER,
    });

    return await this.userService.updateUserById(user.id, {
      templeId,
      role: ERole.TEMPLE_MEMBER,
      passwordChangedAt: new Date(),
    });
  }

  async getTempleMembers(
    templeId: number,
    getTempleMembersArgs: VGetTempleMembersArgs,
  ) {
    return await this.userService.getTempleMembers(
      templeId,
      getTempleMembersArgs,
    );
  }

  async removeTempleMember(
    templeId: number,
    removeTempleMemberInput: VRemoveTempleMemberInput,
  ) {
    const { userId } = removeTempleMemberInput;
    const user = await this.userService.getUserById(userId);

    if (user.templeId !== templeId) {
      throw new HttpException(
        ErrorMessage.INVALID_PARAM,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.userService.updateUserById(userId, {
      templeId: null,
      role: ERole.PUBLIC_USER,
    });
  }

  async getTempleAndTempleFollowers(templeId: number) {
    return await this.templeRepository
      .createQueryBuilder('temple')
      .where({ id: templeId })
      .leftJoinAndSelect('temple.followerTemples', 'followerTemples')
      .leftJoinAndSelect('followerTemples.user', 'user')
      .leftJoinAndSelect('user.userDetail', 'userDetail')
      .getOne();
  }

  async getTempleAndTempleMembers(templeId: number) {
    return await this.templeRepository
      .createQueryBuilder('temple')
      .where({ id: templeId })
      .leftJoinAndSelect('temple.users', 'users')
      .leftJoinAndSelect('users.userDetail', 'userDetail')
      .getOne();
  }

  async updateTemple(templeId: number, updateTempleInput: VUpdateTempleInput) {
    return await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        const templeRepository = entityManager.getRepository(Temple);
        const temple = await templeRepository.findOne({
          where: { id: templeId },
        });
        if (updateTempleInput.name) {
          updateTempleInput.name = updateTempleInput.name
            .replace('Chùa', '')
            .replace('chùa', '')
            .trim();
        }

        const { descriptionImages, ...params } = updateTempleInput;

        if (updateTempleInput.avatar) {
          await this.cloudinaryService.deleteImagesByUrls([temple.avatar]);
        }

        if (descriptionImages && descriptionImages.length) {
          await this.imageService.deleteImagesByTempleId(
            templeId,
            entityManager,
          );

          await this.imageService.createImages(
            descriptionImages.map((descriptionImage) => ({
              image: descriptionImage,
              templeId,
            })),
          );
        }
        return await templeRepository.update(templeId, params);
      },
    );
  }
}
