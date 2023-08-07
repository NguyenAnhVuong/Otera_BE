import { CloudinaryService } from './../cloudinary/cloudinary.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Deceased } from 'src/core/database/entity/deceased.entity';
import { Repository, DataSource, EntityManager, DeepPartial } from 'typeorm';
import { VCreateDeceasedDto } from './dto/create-deceased.dto';
import { UserDetail } from 'src/core/database/entity/userDetail.entity';
import { UserDetailService } from '../user-detail/user-detail.service';
import { ImageService } from '../image/image.service';

@Injectable()
export class DeceasedService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,

    private readonly cloudinaryService: CloudinaryService,

    private readonly userDetailService: UserDetailService,

    private readonly imageService: ImageService,

    private readonly dataSource: DataSource,
  ) {}
  async createDeceased(
    deceasedParams: VCreateDeceasedDto,
    avatar: Express.Multer.File,
    images: Express.Multer.File[],
    creatorId: number,
  ) {
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
        familyId,
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
        familyId,
        userDetailId: userDetail.id,
        creatorId,
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
}
