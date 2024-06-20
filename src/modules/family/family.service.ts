import { ErrorMessage } from '@core/enum';
import { IUserData } from '@core/interface/default.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Family } from 'src/core/database/entity/family.entity';
import { ERole } from 'src/core/enum/default.enum';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FamilyTempleService } from './../family-temple/family-temple.service';
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

    private readonly familyTempleService: FamilyTempleService,

    private readonly dataSource: DataSource,
  ) {}

  // TODO approved by temple and generate family code
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
        order: {
          id: 'DESC',
        },
      });
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
    const { tid, fid } = userData;
    if (tid[0]) {
      const familyInTemple = await this.familyTempleService.checkFamilyInTemple(
        getFamilyMembersArgs.id,
        tid[0],
      );

      if (!familyInTemple && fid !== getFamilyMembersArgs.id) {
        throw new HttpException(
          ErrorMessage.NO_PERMISSION,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return await this.userService.getUserInFamily(getFamilyMembersArgs);
  }
}
