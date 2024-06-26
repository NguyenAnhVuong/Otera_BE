import { IUserData } from '@core/interface/default.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Family } from 'src/core/database/entity/family.entity';
import { ERole } from 'src/core/enum/default.enum';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserService } from './../user/user.service';
import { VCreateFamilyDto } from './dto/create-family.dto';
import { GetFamilyMembersArgs } from './dto/get-family-members.dto';
import { GetFamilyArgs } from './dto/get-family.args';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(Family)
    private familyRepository: Repository<Family>,

    private readonly cloudinaryService: CloudinaryService,

    private readonly userService: UserService,

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
      // get biggest family id
      const family = await familyRepository.findOne({
        where: {},
        order: {
          id: 'DESC',
        },
      });
      if (familyParams.description === 'undefined') {
        familyParams.description = null;
      }

      const newFamily = await familyRepository.save({
        ...familyParams,
        familyCode: `FM${family.id + 1}`,
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

      return newFamily;
    });
  }

  async getFamilyById(getFamilyArgs: GetFamilyArgs) {
    const { id } = getFamilyArgs;
    const query = this.familyRepository.createQueryBuilder('family').where({
      id,
    });

    return await query.getOne();
  }

  async getFamilyMembers(
    userData: IUserData,
    getFamilyMembersArgs: GetFamilyMembersArgs,
  ) {
    return await this.userService.getUserInFamily(getFamilyMembersArgs);
  }
}
