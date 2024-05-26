import { CloudinaryService } from './../cloudinary/cloudinary.service';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Deceased } from 'src/core/database/entity/deceased.entity';
import { Repository, DataSource, EntityManager, DeepPartial } from 'typeorm';
import { VCreateDeceasedDto } from './dto/create-deceased.dto';
import { UserDetail } from 'src/core/database/entity/userDetail.entity';
import { UserDetailService } from '../user-detail/user-detail.service';
import { ImageService } from '../image/image.service';
import { IUserData } from '@core/interface/default.interface';
import { FamilyTempleService } from '@modules/family-temple/family-temple.service';
import { ErrorMessage } from '@core/enum';
import * as dayjs from 'dayjs';
import { VUpdateDeceasedInput } from './dto/update-deceased.input';
import { DeathAnniversaryService } from '@modules/death-anniversary/death-anniversary.service';

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
      },
      relations: ['images', 'userDetail'],
    });
  }

  async getDeceasedByIdAndFamilyId(id: number, familyId: number) {
    return await this.deceasedRepository.findOne({
      where: {
        id,
        familyId,
        isDeleted: false,
      },
      relations: ['images', 'userDetail', 'modifier', 'modifier.userDetail'],
    });
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
}
