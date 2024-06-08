import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/core/database/entity/image.entity';
import { Temple } from 'src/core/database/entity/temple.entity';
import { ERole } from 'src/core/enum/default.enum';
import { returnPagingData } from 'src/helper/utils';
import {
  DataSource,
  DeepPartial,
  EntityManager,
  ILike,
  Repository,
} from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserService } from '../user/user.service';
import { ImageService } from './../image/image.service';
import { VCreateTempleDto } from './dto/create-temple.dto';
import { VGetTemplesDto } from './dto/get-temples.dto';
import { ErrorMessage } from '@core/enum';
import { VSystemGetTemplesDto } from './dto/system-get-temples.input';

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
    return await this.dataSource.transaction(async (manager: EntityManager) => {
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
    return await this.templeRepository.findOne({
      where: { id },
      relations: ['images'],
    });
  }

  async getTempleDetail(id: number, userId?: number): Promise<Temple> {
    return await this.templeRepository
      .createQueryBuilder('temple')
      .where({
        id,
      })
      .leftJoinAndSelect('temple.images', 'images')
      .leftJoinAndSelect(
        'temple.followerTemples',
        'followerTemples',
        'followerTemples.userId = :userId',
        {
          userId,
        },
      )
      .getOne();
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

  async getTemples(query: VGetTemplesDto) {
    const { skip, take, keyword, familyId } = query;
    const [items, totalItems] = await this.templeRepository.findAndCount({
      where: {
        ...(keyword && { name: ILike(`%${keyword}%`) }),
        ...(familyId && {
          familyTemples: {
            familyId,
          },
        }),
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

  async systemGetTemples(query: VSystemGetTemplesDto) {
    const { skip, take, keyword, familyId, priority, status } = query;
    const [items, totalItems] = await this.templeRepository.findAndCount({
      where: {
        ...(keyword && { name: ILike(`%${keyword}%`) }),
        ...(familyId && {
          familyTemples: {
            familyId,
          },
        }),
        ...(priority && { priority }),
        ...(status && { status }),
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
