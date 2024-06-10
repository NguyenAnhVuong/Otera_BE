import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/core/database/entity/image.entity';
import { Temple } from 'src/core/database/entity/temple.entity';
import { ERole, EStatus } from 'src/core/enum/default.enum';
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
import { VUpdateStatusTempleInput } from './dto/update-status-temple.input';
import { IUserData } from '@core/interface/default.interface';

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
      where: { id, status: EStatus.APPROVED },
      relations: ['images'],
    });
  }

  async getTempleDetail(id: number, userData?: IUserData): Promise<Temple> {
    const { id: userId, role } = userData;
    return await this.templeRepository
      .createQueryBuilder('temple')
      .where({
        id,
        ...(role !== ERole.SYSTEM && { status: EStatus.APPROVED }),
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
        status: EStatus.APPROVED,
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

  async systemGetTemples(systemGetTemplesQuery: VSystemGetTemplesDto) {
    const { name, email, address, orderBy, status, skip, take } =
      systemGetTemplesQuery;
    const query = this.templeRepository
      .createQueryBuilder('temple')
      .leftJoinAndSelect('temple.images', 'images')
      .leftJoinAndSelect('temple.admin', 'admin')
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

  async updateStatusTemple(updateStatusTemple: VUpdateStatusTempleInput) {
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

    return await this.templeRepository.update(id, {
      status,
      rejectReason,
      blockReason,
    });
  }
}
