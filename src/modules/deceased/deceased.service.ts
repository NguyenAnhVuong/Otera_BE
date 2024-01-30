import { CloudinaryService } from './../cloudinary/cloudinary.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

@Injectable()
export class DeceasedService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,

    private readonly cloudinaryService: CloudinaryService,

    private readonly userDetailService: UserDetailService,

    private readonly imageService: ImageService,

    private readonly familyTempleService: FamilyTempleService,

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
        birthday,
        address,
        gender,
        citizenNumber,
      };

      const userDetail = await this.userDetailService.createUserDetail(
        userDetailParams,
        manager,
      );

      const newDeceasedParams: DeepPartial<Deceased> = {
        dateOfDeath,
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
      },
      relations: ['images', 'userDetail'],
    });
  }

  async getDeceasedByIdAndFamilyId(id: number, familyId: number) {
    return await this.deceasedRepository.findOne({
      where: {
        id,
        familyId,
      },
      relations: ['images', 'userDetail'],
    });
  }

  async checkDeceasedInFamily(deceasedId: number, familyId: number) {
    const deceased = await this.deceasedRepository.findOne({
      where: {
        id: deceasedId,
        familyId,
      },
    });

    if (!deceased) {
      throw new HttpException(
        ErrorMessage.DECEASED_NOT_IN_FAMILY,
        HttpStatus.BAD_REQUEST,
      );
    }
    return deceased;
  }
}
