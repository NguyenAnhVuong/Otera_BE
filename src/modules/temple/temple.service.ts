import { ImageService } from './../image/image.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Temple } from 'src/core/database/entity/temple.entity';
import {
  DataSource,
  DeepPartial,
  EntityManager,
  Like,
  Repository,
} from 'typeorm';
import { VCreateTempleDto } from './dto/create-temple.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Image } from 'src/core/database/entity/image.entity';
import { UserService } from '../user/user.service';
import { ERole } from 'src/core/enum/default.enum';
import { IPaginationQuery } from 'src/core/interface/default.interface';
import { returnPagingData } from 'src/helper/utils';
import { VGetTemplesDto } from './dto/get-temples.dto';

@Injectable()
export class TempleService {
  constructor(
    @InjectRepository(Temple)
    private readonly templeRepository: Repository<Temple>,

    private readonly cloudinaryService: CloudinaryService,

    private readonly imageService: ImageService,

    private readonly userService: UserService,

    private readonly dataSource: DataSource,
  ) {}

  async createTemple(
    adminId: number,
    templeParams: VCreateTempleDto,
    avatar: Express.Multer.File,
    images?: Express.Multer.File[],
  ): Promise<Temple> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const templeRepository = manager.getRepository(Temple);
      const uploadedAvatar = await this.cloudinaryService.uploadImage(avatar);
      const newTemple = await templeRepository.save({
        ...templeParams,
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

      await this.userService.updateUserById(
        adminId,
        {
          role: ERole.TEMPLE_ADMIN,
        },
        manager,
      );

      return newTemple;
    });
  }

  async getTempleById(id: number): Promise<Temple> {
    return this.templeRepository.findOne({
      where: { id },
      relations: ['images'],
    });
  }

  async getTemples(query: VGetTemplesDto) {
    const { skip, take, keyword } = query;
    const [items, totalItems] = await this.templeRepository.findAndCount({
      where: {
        name: Like(`%${keyword}%`),
      },
      skip,
      take,
      order: {
        priority: 'DESC',
        createdAt: 'DESC',
      },
    });

    return returnPagingData(items, totalItems, query);
  }
}
