import { IUserData } from '@core/interface/default.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDetail } from 'src/core/database/entity/userDetail.entity';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { VUpdateUserDetailInput } from './dto/update-user-detail.input';
import { CloudinaryService } from '@modules/cloudinary/cloudinary.service';
import { ErrorMessage } from '@core/enum';
import * as dayjs from 'dayjs';
import { FormatDate } from '@core/constants/formatDate';

@Injectable()
export class UserDetailService {
  constructor(
    @InjectRepository(UserDetail)
    private userDetailRepository: Repository<UserDetail>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createUserDetail(
    userDetailParams: DeepPartial<UserDetail>,
    entityManager?: EntityManager,
  ) {
    const userDetailRepository =
      entityManager?.getRepository(UserDetail) || this.userDetailRepository;
    const userDetail = await userDetailRepository.save(userDetailParams);
    return userDetail;
  }

  async updateUserDetail(
    userDetailParams: DeepPartial<UserDetail>,
    entityManager?: EntityManager,
  ) {
    const userDetailRepository =
      entityManager?.getRepository(UserDetail) || this.userDetailRepository;
    const userDetail = await userDetailRepository.update(
      userDetailParams.id,
      userDetailParams,
    );
    return userDetail;
  }

  async userUpdateUserDetail(
    userData: IUserData,
    updateUserDetailInput: VUpdateUserDetailInput,
  ) {
    const { id: userId } = userData;
    const userDetail = await this.userDetailRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!userDetail) {
      throw new HttpException(
        ErrorMessage.ACCOUNT_NOT_EXISTS,
        HttpStatus.NOT_FOUND,
      );
    }

    if (updateUserDetailInput.avatar) {
      await this.cloudinaryService.deleteImagesByUrls([userDetail.avatar]);
    }

    if (updateUserDetailInput.birthday) {
      updateUserDetailInput.birthday = dayjs(
        updateUserDetailInput.birthday,
      ).format(FormatDate.YYYY_MM_DD);
    }

    return await this.userDetailRepository.update(
      userDetail.id,
      updateUserDetailInput,
    );
  }
}
