import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDetail } from 'src/core/database/entity/userDetail.entity';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserDetailService {
  constructor(
    @InjectRepository(UserDetail)
    private userDetailRepository: Repository<UserDetail>,
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
}
