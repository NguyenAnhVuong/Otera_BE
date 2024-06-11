import { ERole, EStatus, ErrorMessage } from '@core/enum';
import { IUserData } from '@core/interface/default.interface';
import { DeathAnniversaryService } from '@modules/death-anniversary/death-anniversary.service';
import { FamilyTempleService } from '@modules/family-temple/family-temple.service';
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

@Injectable()
export class DeceasedService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,

    private readonly cloudinaryService: CloudinaryService,

    private readonly userDetailService: UserDetailService,

    private readonly imageService: ImageService,

    private readonly familyTempleService: FamilyTempleService,

    @Inject(forwardRef(() => DeathAnniversaryService))
    private readonly deathAnniversaryService: DeathAnniversaryService,

    private readonly dataSource: DataSource,
  ) {}
  async createDeceased(
    deceasedParams: VCreateDeceasedDto,
    avatar: Express.Multer.File,
    images: Express.Multer.File[],
    userData: IUserData,
  ) {
    const { fid, id } = userData;
    const familyTemple = await this.familyTempleService.checkFamilyInTemple(
      fid,
      deceasedParams.templeId,
    );

    if (!familyTemple) {
      throw new HttpException(
        ErrorMessage.FAMILY_NOT_IN_TEMPLE,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const uploadedAvatar = await this.cloudinaryService.uploadImage(avatar);

      const {
        name,
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
        birthday: dayjs(birthday).format('YYYY-MM-DD'),
        address,
        gender,
        ...(citizenNumber && { citizenNumber }),
      };

      const userDetail = await this.userDetailService.createUserDetail(
        userDetailParams,
        manager,
      );

      const newDeceasedParams: DeepPartial<Deceased> = {
        dateOfDeath: dayjs(dateOfDeath).format('YYYY-MM-DD'),
        templeId,
        familyId: fid,
        userDetailId: userDetail.id,
        creatorId: id,
        description,
      };

      const deceasedRepository = manager.getRepository(Deceased);
      const deceased = await deceasedRepository.save(newDeceasedParams);

      const uploadedImages = await this.cloudinaryService.uploadImages(images);

      const imagesParams = uploadedImages.map((image) => ({
        image: image.url,
        deceasedId: deceased.id,
      }));

      await this.imageService.createImages(imagesParams, manager);

      return deceased;
    });
  }

  async getListDeceasedByFamilyId(familyId: number) {
    return await this.deceasedRepository.find({
      where: {
        familyId,
        isDeleted: false,
        status: EStatus.APPROVED,
      },
      relations: ['images', 'userDetail'],
    });
  }

  async getDeceasedDetail(id: number, userData: IUserData) {
    const { fid: familyId, role } = userData;
    return await this.deceasedRepository
      .createQueryBuilder('deceased')
      .where({
        id,
        ...(role === ERole.TEMPLE_ADMIN || role === ERole.TEMPLE_MEMBER
          ? {}
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
        (deathAnniversaries.status = :pendingStatus OR 
          (deathAnniversaries.status = :rejectStatus AND deathAnniversaries.enableUpdate = false))`,
        {
          now: new Date(),
          pendingStatus: EStatus.PENDING,
          rejectStatus: EStatus.REJECTED,
        },
      )
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
      templeId,
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
          ...(birthday && { birthday: dayjs(birthday).format('YYYY-MM-DD') }),
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

        return await deceasedRepository.update(
          { id },
          {
            modifierId,
            ...(dateOfDeath && {
              dateOfDeath: dayjs(dateOfDeath).format('YYYY-MM-DD'),
            }),
            ...(description && { description }),
            ...(templeId && { templeId }),
          },
        );
      },
    );
  }

  // TODO required approve by temple
  async deleteDeceased(userData: IUserData, id: number) {
    const { fid } = userData;

    return await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        const deceasedRepository = entityManager.getRepository(Deceased);

        const deceased = await this.checkDeceasedInFamily(
          id,
          fid,
          entityManager,
        );

        if (!deceased) {
          throw new HttpException(
            ErrorMessage.NO_PERMISSION,
            HttpStatus.BAD_REQUEST,
          );
        }
        this.deathAnniversaryService.deleteDeathAnniversaryByDeceasedId(
          id,
          entityManager,
        );
        return await deceasedRepository.update({ id }, { isDeleted: true });
      },
    );
  }

  async updateDeceasedStatus(
    updateDeceasedStatusInput: VUpdateDeceasedStatusInput,
    templeId: number,
  ) {
    const { id, status, rejectReason } = updateDeceasedStatusInput;
    return await this.deceasedRepository.update(
      { id, templeId },
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
    });

    if (!deceased) {
      throw new HttpException(
        ErrorMessage.NO_PERMISSION,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.deceasedRepository.update({ id }, { isDeleted: false });
  }
}
