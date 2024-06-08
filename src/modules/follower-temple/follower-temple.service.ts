import { FollowerTemple } from '@core/database/entity/followerTemple.entity';
import { ErrorMessage } from '@core/enum';
import { TempleService } from '@modules/temple/temple.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VFollowTempleInput } from './dto/follow-temple.input';
import { VGetFollowerArgs } from './dto/temple-get-follower.args';
import { returnPagingData } from '@helper/utils';

@Injectable()
export class FollowerTempleService {
  constructor(
    @InjectRepository(FollowerTemple)
    private readonly followerTempleRepository: Repository<FollowerTemple>,
    private readonly templeService: TempleService,
  ) {}

  async createFollowerTemple(
    userId: number,
    createFollowerTempleInput: VFollowTempleInput,
  ) {
    const { templeId } = createFollowerTempleInput;
    const temple = await this.templeService.getTempleById(templeId);

    if (!temple) {
      throw new HttpException(
        ErrorMessage.TEMPLE_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.followerTempleRepository.save({
      templeId,
      userId,
    });

    return true;
  }

  async getFollowerTemplesByTempleId(
    templeId: number,
    getFollowerArgs: VGetFollowerArgs,
  ) {
    const { name, email, phone, address, familyName, orderBy, isInFamily } =
      getFollowerArgs;
    const query = this.followerTempleRepository
      .createQueryBuilder('followerTemple')
      .where('followerTemple.templeId = :templeId', { templeId })
      .leftJoinAndSelect('followerTemple.user', 'user')
      .leftJoinAndSelect('user.family', 'family')
      .leftJoinAndSelect('user.userDetail', 'userDetail')
      .orderBy('createdAt', 'DESC');

    if (isInFamily) {
      query.andWhere('user.familyId IS NOT NULL', { familyId: isInFamily });
    }

    if (name) {
      query.andWhere('userDetail.name LIKE :name', { name: `%${name}%` });
    }

    if (email) {
      query.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }

    if (phone) {
      query.andWhere('user.phone LIKE :phone', { phone: `%${phone}%` });
    }

    if (address) {
      query.andWhere('userDetail.address LIKE :address', {
        address: `%${address}%`,
      });
    }

    if (familyName) {
      query.andWhere('userDetail.familyName LIKE :familyName', {
        familyName: `%${familyName}%`,
      });
    }

    if (orderBy) {
      orderBy.forEach((order) => {
        query.addOrderBy(order.column, order.sortOrder);
      });
    }

    const [data, count] = await query.getManyAndCount();

    return returnPagingData(data, count, getFollowerArgs);
  }

  async deleteFollowerTemple(userId: number, templeId: number) {
    const publicUserTemple = await this.followerTempleRepository.findOne({
      where: { userId, templeId },
    });

    if (!publicUserTemple) {
      throw new HttpException(
        ErrorMessage.PUBLIC_USER_TEMPLE_NOT_EXIST,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.followerTempleRepository.delete(publicUserTemple.id);

    return true;
  }
}
