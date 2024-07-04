import {
  EDeathAnniversaryStatus,
  ERole,
  EStatus,
  ErrorMessage,
} from '@core/enum';
import { IUserData } from '@core/interface/default.interface';
import { DeathAnniversaryService } from '@modules/death-anniversary/death-anniversary.service';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { Deceased } from 'src/core/database/entity/deceased.entity';
import { UserDetail } from 'src/core/database/entity/userDetail.entity';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { ImageService } from '../image/image.service';
import { UserDetailService } from '../user-detail/user-detail.service';
import { CloudinaryService } from './../cloudinary/cloudinary.service';
import { VCreateDeceasedDto } from './dto/create-deceased.dto';
import { VUpdateDeceasedStatusInput } from './dto/update-deceased-status.input';
import { VUpdateDeceasedInput } from './dto/update-deceased.input';
import { VTempleGetListDeceasedArgs } from './dto/temple-get-deceased-list.args';
import { returnPagingData } from '@helper/utils';
import { VFamilyGetListDeceasedArgs } from './dto/family-get-list-deceased.dto';
import { VAddDeceasedImageInput } from './dto/add-deceased-image.input';
import { QueueProcessorService } from '@core/global/queueProcessor/quequeProcessor.service';
import { QUEUE_MODULE_OPTIONS } from '@core/global/queueProcessor/queueIdentity.constant';
import { TempleService } from '@modules/temple/temple.service';
import { FormatDate } from '@core/constants/formatDate';

@Injectable()
export class DeceasedService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,

    private readonly cloudinaryService: CloudinaryService,

    private readonly userDetailService: UserDetailService,

    private readonly imageService: ImageService,

    @Inject(forwardRef(() => DeathAnniversaryService))
    private readonly deathAnniversaryService: DeathAnniversaryService,

    private readonly templeService: TempleService,

    private readonly queueProcessorService: QueueProcessorService,

    private readonly dataSource: DataSource,
  ) {}
  async createDeceased(
    deceasedParams: VCreateDeceasedDto,
    avatar: Express.Multer.File,
    images: Express.Multer.File[],
    userData: IUserData,
  ) {
    const { fid, id } = userData;

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const uploadedAvatar = await this.cloudinaryService.uploadImage(avatar);

      const {
        name,
        tombAddress,
        birthday,
        address,
        gender,
        citizenNumber,
        dateOfDeath,
        templeId,
        description,
      } = deceasedParams;

      const userDetailParams: DeepPartial<UserDetail> = {
        avatar: uploadedAvatar.url,
        name,
        birthday: dayjs(birthday).format(FormatDate.YYYY_MM_DD),
        address,
        gender,
        ...(citizenNumber && { citizenNumber }),
      };

      const userDetail = await this.userDetailService.createUserDetail(
        userDetailParams,
        manager,
      );

      const temple = await this.templeService.getTempleById(templeId);

      if (!temple) {
        throw new HttpException(
          ErrorMessage.TEMPLE_NOT_EXIST,
          HttpStatus.BAD_REQUEST,
        );
      }

      const newDeceasedParams: DeepPartial<Deceased> = {
        dateOfDeath: dayjs(dateOfDeath).format(FormatDate.YYYY_MM_DD),
        templeId,
        familyId: fid,
        userDetailId: userDetail.id,
        creatorId: id,
        description,
        tombAddress,
      };

      const deceasedRepository = manager.getRepository(Deceased);
      const deceased = await deceasedRepository.save(newDeceasedParams);

      const uploadedImages = await this.cloudinaryService.uploadImages(images);

      const imagesParams = uploadedImages.map((image) => ({
        image: image.url,
        deceasedId: deceased.id,
      }));

      await this.imageService.createImages(imagesParams, manager);

      await this.queueProcessorService.handleAddQueue(
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME,
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.DECLARE_DECEASED,
        {
          userId: id,
          deceasedId: deceased.id,
          userName: userData.name,
          deceasedName: name,
          templeId,
          templeName: temple.name,
        },
      );

      return deceased;
    });
  }

  async addDeceasedImage(
    userData: IUserData,
    addDeceasedImageInput: VAddDeceasedImageInput,
  ) {
    const { id: deceasedId, images } = addDeceasedImageInput;
    const { id: modifierId, fid } = userData;

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const deceased = await this.checkDeceasedInFamily(
        deceasedId,
        fid,
        manager,
      );

      const newImages = images.map((image) => ({
        image,
        deceasedId,
      }));

      await this.queueProcessorService.handleAddQueue(
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME,
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.CONTRIBUTE_DECEASED_IMAGE,
        {
          userId: userData.id,
          deceasedId,
          familyId: fid,
          userName: userData.name,
          deceasedName: deceased.userDetail.name,
        },
      );

      const deceasedRepository = manager.getRepository(Deceased);

      await deceasedRepository.update({ id: deceasedId }, { modifierId });

      return await this.imageService.createImages(newImages, manager);
    });
  }

  async getDeceasedById(id: number, entityManager?: EntityManager) {
    const deceasedRepository = entityManager
      ? entityManager.getRepository(Deceased)
      : this.deceasedRepository;

    return await deceasedRepository.findOne({
      where: {
        id,
        isDeleted: false,
      },
      relations: ['userDetail'],
    });
  }

  async getListDeceasedByFamilyId(
    familyId: number,
    familyGetListDeceasedArgs: VFamilyGetListDeceasedArgs,
  ) {
    const { skip, take, orderBy, keyword } = familyGetListDeceasedArgs;
    const query = this.deceasedRepository
      .createQueryBuilder('deceased')
      .where({
        familyId,
        isDeleted: false,
        status: EStatus.APPROVED,
      })
      .leftJoinAndSelect('deceased.images', 'images')
      .leftJoinAndSelect('deceased.userDetail', 'userDetail')
      .skip(skip)
      .take(take)
      .orderBy('deceased.createdAt', 'DESC');

    if (keyword) {
      query.andWhere(
        '(userDetail.name ILIKE :keyword OR userDetail.address ILIKE :keyword)',
        {
          keyword: `%${keyword}%`,
        },
      );
    }

    const [data, count] = await query.getManyAndCount();

    return returnPagingData(data, count, familyGetListDeceasedArgs);
  }

  async getPendingDeceasedById(id: number) {
    return await this.deceasedRepository.findOne({
      where: {
        id,
      },
      relations: ['userDetail'],
    });
  }

  async getDeceasedDetail(id: number, userData: IUserData) {
    const { fid: familyId, role, tid } = userData;
    return await this.deceasedRepository
      .createQueryBuilder('deceased')
      .where({
        id,
        ...(role === ERole.TEMPLE_ADMIN || role === ERole.TEMPLE_MEMBER
          ? {
              templeId: tid[0],
            }
          : { familyId, status: EStatus.APPROVED, isDeleted: false }),
      })
      .leftJoinAndSelect('deceased.images', 'images')
      .leftJoinAndSelect('deceased.userDetail', 'userDetail')
      .leftJoinAndSelect('deceased.modifier', 'modifier')
      .leftJoinAndSelect('modifier.userDetail', 'modifierUserDetail')
      .leftJoinAndSelect(
        'deceased.deathAnniversaries',
        'deathAnniversaries',
        `deathAnniversaries.isDeleted = false AND deathAnniversaries.desiredStartTime > :now AND
        (deathAnniversaries.status = :pendingStatus OR deathAnniversaries.status = :approvedStatus OR deathAnniversaries.status = :readyStatus OR
          (deathAnniversaries.status = :rejectStatus AND deathAnniversaries.enableUpdate = false))`,
        {
          now: new Date(),
          pendingStatus: EDeathAnniversaryStatus.PENDING,
          rejectStatus: EDeathAnniversaryStatus.REJECTED,
          approvedStatus: EDeathAnniversaryStatus.APPROVED,
          readyStatus: EDeathAnniversaryStatus.READY,
        },
      )
      .leftJoinAndSelect('deceased.temple', 'temple')
      .getOne();
  }

  async checkDeceasedInFamily(
    deceasedId: number,
    familyId: number,
    entityManager?: EntityManager,
  ) {
    const deceasedRepository = entityManager
      ? entityManager.getRepository(Deceased)
      : this.deceasedRepository;

    const deceased = await deceasedRepository.findOne({
      where: {
        id: deceasedId,
        familyId,
        isDeleted: false,
        status: EStatus.APPROVED,
      },
      relations: ['userDetail'],
    });

    if (!deceased) {
      throw new HttpException(
        ErrorMessage.DECEASED_NOT_IN_FAMILY,
        HttpStatus.BAD_REQUEST,
      );
    }
    return deceased;
  }

  async updateDeceased(
    userData: IUserData,
    updateDeceasedInput: VUpdateDeceasedInput,
  ) {
    const { id: modifierId, fid } = userData;
    const {
      id,
      dateOfDeath,
      description,
      avatar,
      images,
      name,
      birthday,
      address,
      gender,
      citizenNumber,
    } = updateDeceasedInput;

    return await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        const deceasedRepository = entityManager.getRepository(Deceased);

        const deceased = await this.checkDeceasedInFamily(id, fid);

        if (!deceased) {
          throw new HttpException(
            ErrorMessage.NO_PERMISSION,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (avatar) {
          await this.cloudinaryService.deleteImagesByUrls([
            deceased.userDetail.avatar,
          ]);
        }

        await this.userDetailService.updateUserDetail({
          id: deceased.userDetailId,
          ...(name && { name }),
          ...(birthday && { birthday }),
          ...(address && { address }),
          ...(gender && {
            gender,
          }),
          ...(citizenNumber && { citizenNumber }),
          ...(avatar && { avatar }),
        });

        if (images && images.length) {
          await this.imageService.updateImageByDeceasedId(
            id,
            images.map((image) => ({ image, deceasedId: id })),
            entityManager,
          );
        }

        await this.queueProcessorService.handleAddQueue(
          QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME,
          QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.UPDATE_DECEASED,
          {
            userId: userData.id,
            familyId: fid,
            deceasedId: id,
            userName: userData.name,
            deceasedName: name,
          },
        );

        return await deceasedRepository.update(
          { id },
          {
            modifierId,
            ...(dateOfDeath && {
              dateOfDeath,
            }),
            ...(description && { description }),
          },
        );
      },
    );
  }

  // TODO delete reason
  async deleteDeceased(userData: IUserData, id: number) {
    const { fid, tid } = userData;

    return await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        const deceasedRepository = entityManager.getRepository(Deceased);

        const deceased = await this.getDeceasedById(id, entityManager);

        if (!deceased) {
          throw new HttpException(
            ErrorMessage.DECEASED_NOT_EXIST,
            HttpStatus.BAD_REQUEST,
          );
        }

        await this.deathAnniversaryService.deleteDeathAnniversaryByDeceasedId(
          id,
          entityManager,
        );

        await this.queueProcessorService.handleAddQueue(
          QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME,
          QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.DELETE_DECEASED,
          {
            userId: userData.id,
            deceasedId: id,
            userName: userData.name,
            deceasedName: deceased.userDetail.name,
          },
        );

        return await deceasedRepository.update({ id }, { isDeleted: true });
      },
    );
  }

  async updateDeceasedStatus(
    updateDeceasedStatusInput: VUpdateDeceasedStatusInput,
    userData: IUserData,
  ) {
    const { id: userId, tid } = userData;
    const { id, status, rejectReason } = updateDeceasedStatusInput;
    if (status === EStatus.APPROVED) {
      await this.queueProcessorService.handleAddQueue(
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME,
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.APPROVE_DECEASED,
        {
          userId,
          deceasedId: id,
          templeId: tid[0],
        },
      );
    } else if (status === EStatus.REJECTED) {
      await this.queueProcessorService.handleAddQueue(
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME,
        QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.REJECT_DECEASED,
        {
          userId,
          deceasedId: id,
          templeId: tid[0],
          rejectReason,
        },
      );
    }

    return await this.deceasedRepository.update(
      { id, templeId: tid[0] },
      { status, rejectReason },
    );
  }

  async templeGetListDeceased(
    templeId: number,
    templeGetDeceasedListArgs: VTempleGetListDeceasedArgs,
  ) {
    const {
      name,
      address,
      status,
      isDeleted,
      orderBy,
      tombAddress,
      familyKeyword,
    } = templeGetDeceasedListArgs;

    const query = this.deceasedRepository
      .createQueryBuilder('deceased')
      .where('deceased.templeId = :templeId', {
        templeId,
      })
      .leftJoinAndSelect('deceased.userDetail', 'userDetail')
      .leftJoinAndSelect('deceased.family', 'family')
      .orderBy('deceased.createdAt', 'DESC');

    if (name) {
      query.andWhere('userDetail.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    if (address) {
      query.andWhere('userDetail.address ILIKE :address', {
        address: `%${address}%`,
      });
    }

    if (status) {
      query.andWhere('deceased.status = :status', { status });
    }

    if (isDeleted) {
      query.andWhere('deceased.isDeleted = :isDeleted', { isDeleted });
    } else {
      query.andWhere('deceased.isDeleted = false');
    }

    if (familyKeyword) {
      query.andWhere(
        'family.name ILIKE :familyKeyword OR family.familyCode ILIKE :familyKeyword',
        {
          familyKeyword: `%${familyKeyword}%`,
        },
      );
    }

    if (tombAddress) {
      query.andWhere('deceased.tombAddress ILIKE :tombAddress', {
        tombAddress: `%${tombAddress}%`,
      });
    }

    if (orderBy) {
      orderBy.forEach((order) => {
        if (order.column === 'birthday') {
          query.addOrderBy(`userDetail.${order.column}`, order.sortOrder);
        } else {
          query.addOrderBy(`deceased.${order.column}`, order.sortOrder);
        }
      });
    }

    const [data, count] = await query.getManyAndCount();

    return returnPagingData(data, count, templeGetDeceasedListArgs);
  }

  async restoreDeceased(id: number, userData: IUserData) {
    const { tid } = userData;

    const deceased = await this.deceasedRepository.findOne({
      where: {
        id,
        templeId: tid[0],
        isDeleted: true,
      },
      relations: ['userDetail'],
    });

    if (!deceased) {
      throw new HttpException(
        ErrorMessage.DECEASED_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.queueProcessorService.handleAddQueue(
      QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.NAME,
      QUEUE_MODULE_OPTIONS.SEND_MAIL_DECEASED.JOBS.RESTORE_DECEASED,
      {
        userId: userData.id,
        userName: userData.name,
        deceasedId: id,
        familyId: deceased.familyId,
        templeId: tid[0],
        deceasedName: deceased.userDetail.name,
      },
    );

    return await this.deceasedRepository.update({ id }, { isDeleted: false });
  }

  async getDeathAnniversaryNextDayDeceaseds(day?: number) {
    let nextDay = dayjs();

    if (day) {
      nextDay = dayjs().add(day, 'day');
    }

    const nextWeekMonth = nextDay.month() + 1;
    const nextWeekDay = nextDay.date();

    return await this.deceasedRepository
      .createQueryBuilder('deceased')
      .where('deceased.status = :status', { status: EStatus.APPROVED })
      .andWhere(
        "EXTRACT(MONTH FROM TO_DATE(deceased.dateOfDeath, 'YYYY/MM/DD')) = :nextWeekMonth",
        { nextWeekMonth },
      )
      .andWhere(
        "EXTRACT(DAY FROM TO_DATE(deceased.dateOfDeath, 'YYYY/MM/DD')) = :nextWeekDay",
        { nextWeekDay },
      )
      .leftJoinAndSelect('deceased.userDetail', 'userDetail')
      .leftJoinAndSelect('deceased.family', 'family')
      .leftJoinAndSelect('family.users', 'users')
      .leftJoinAndSelect('users.userDetail', 'userDetail1')
      .getMany();
  }
}
