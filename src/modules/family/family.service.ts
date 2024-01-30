import { FamilyTempleService } from './../family-temple/family-temple.service';
import { UserService } from './../user/user.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Family } from 'src/core/database/entity/family.entity';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { VCreateFamilyDto } from './dto/create-family.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ERole } from 'src/core/enum/default.enum';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(Family)
    private familyRepository: Repository<Family>,

    private readonly cloudinaryService: CloudinaryService,

    private readonly userService: UserService,

    private readonly familyTempleService: FamilyTempleService,

    private readonly dataSource: DataSource,
  ) {}

  async createFamily(
    familyParams: VCreateFamilyDto,
    avatar: Express.Multer.File,
    adminId: number,
  ): Promise<Family> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const familyRepository = manager.getRepository(Family);
      const uploadedAvatar = await this.cloudinaryService.uploadImage(avatar);
      const newFamily = await familyRepository.save({
        ...familyParams,
        avatar: uploadedAvatar.url,
        adminId,
      });

      await this.userService.updateUserById(
        adminId,
        {
          role: ERole.FAMILY_ADMIN,
          familyId: newFamily.id,
        },
        manager,
      );

      await this.familyTempleService.createFamilyTemple(
        {
          familyId: newFamily.id,
          templeId: familyParams.templeId,
        },
        manager,
      );

      return newFamily;
    });
  }
}
