import { IUserData } from '@core/interface/default.interface';
import { returnPagingData } from '@helper/utils';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { EConfiguration } from 'src/core/config/configuration.config';
import { User } from 'src/core/database/entity/user.entity';
import { ERole } from 'src/core/enum/default.enum';
import { ErrorMessage } from 'src/core/enum/error.enum';
import {
  IJwtPayload,
  IResponseAuth,
  IResponseAuthUser,
  IResponseRefreshToken,
} from 'src/core/global/auth/interface/auth.interface';
import { DataSource, DeepPartial, EntityManager, Repository } from 'typeorm';
import { UserDetailService } from './../user-detail/user-detail.service';
import { VUserLoginDto } from './dto/user-login.dto';
import { VUserRegisterDto } from './dto/user-register.dto';
import { GetFamilyMembersArgs } from '../family/dto/get-family-members.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userDetailService: UserDetailService,
    private dataSource: DataSource,
  ) {}
  async userRegister(userRegister: VUserRegisterDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: userRegister.email,
      },
    });

    if (user) {
      throw new HttpException(
        ErrorMessage.ACCOUNT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(userRegister.password, salt);

    userRegister.password = hashPassword;
    userRegister.role = ERole.PUBLIC_USER;
    return await this.dataSource.transaction(
      async (entityManager: EntityManager) => {
        const userDetail = {
          name: userRegister.name,
          birthday: userRegister.birthday,
          gender: userRegister.gender,
        };
        const newUserDetail = await this.userDetailService.createUserDetail(
          userDetail,
          entityManager,
        );

        const userRepository = entityManager.getRepository(User);
        const newUser = await userRepository.save({
          userDetailId: newUserDetail.id,
          ...userRegister,
        });

        return newUser;
      },
    );
  }

  async userLogin(
    userLogin: VUserLoginDto,
    response: Response,
  ): Promise<IResponseAuth> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: userLogin.email })
      .leftJoinAndSelect('user.userDetail', 'userDetail')
      .leftJoinAndSelect('user.temple', 'temple')
      .leftJoinAndSelect('user.templeMember', 'templeMember')
      .leftJoinAndSelect('user.family', 'family')
      .leftJoinAndSelect('family.familyTemples', 'familyTemples')
      .getOne();

    if (!user) {
      throw new HttpException(
        ErrorMessage.ACCOUNT_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const isMatch = await bcrypt.compare(userLogin.password, user.password);

    if (!isMatch) {
      throw new HttpException(
        ErrorMessage.PASSWORD_INCORRECT,
        HttpStatus.BAD_REQUEST,
      );
    }

    let templeIds = null;

    if (user.templeMember) {
      templeIds = [user.templeMember.templeId];
    }

    if (user.temple) {
      templeIds = [user.temple.id];
    }

    if (user.family && user.family.familyTemples.length > 0) {
      templeIds = user.family.familyTemples.map((temple) => temple.templeId);
    }

    const authUserData: IResponseAuthUser = {
      id: user.id,
      email: user.email,
      avatar: user.userDetail.avatar,
      name: user.userDetail.name,
      role: user.role,
      familyId: user.familyId,
      templeIds,
    };

    return await this.returnResponseAuthUser(authUserData, response);
  }

  async refreshToken(
    refreshToken: string,
    response: Response,
  ): Promise<IResponseRefreshToken> {
    if (!refreshToken) {
      throw new HttpException(
        ErrorMessage.REFRESH_TOKEN_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = (await this.jwtService.verifyAsync(
      refreshToken,
    )) as IJwtPayload;

    const user = await this.userRepository.findOne({
      where: {
        id: payload.id,
      },
      relations: [
        'userDetail',
        'temple',
        'templeMember',
        'family',
        'family.familyTemples',
      ],
    });

    if (!user) {
      throw new HttpException(
        ErrorMessage.ACCOUNT_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const authUserData: IResponseAuthUser = {
      id: user.id,
      email: user.email,
      avatar: user.userDetail.avatar,
      name: user.userDetail.name,
      role: user.role,
      familyId: user.familyId,
      templeIds: user.temple
        ? [user.temple.id]
        : user.family.familyTemples.map((temple) => temple.templeId),
    };

    const data = await this.returnResponseAuthUser(authUserData, response);

    return {
      accessToken: data.accessToken,
    };
  }

  async returnResponseAuthUser(
    authUserData: IResponseAuthUser,
    response: Response,
  ): Promise<IResponseAuth> {
    const payload: IJwtPayload = {
      id: authUserData.id,
      email: authUserData.email,
      avatar: authUserData.avatar,
      name: authUserData.name,
      role: authUserData.role,
      fid: authUserData.familyId,
      tid: authUserData.templeIds,
    };

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<number>(
        EConfiguration.REFRESH_TOKEN_EXPIRES_IN,
      ),
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: this.configService.get<number>(
        EConfiguration.REFRESH_TOKEN_EXPIRES_IN,
      ),
    });

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: authUserData,
    };
  }

  async getAllUser() {
    return await this.userRepository.find();
  }

  async getUserById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUserById(
    id: number,
    data: DeepPartial<User>,
    entityManager?: EntityManager,
  ) {
    const userRepository = entityManager
      ? entityManager.getRepository(User)
      : this.userRepository;
    return await userRepository.update(id, data);
  }

  async userLogout(userData: IUserData, response: Response) {
    const { id } = userData;
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new HttpException(
        ErrorMessage.ACCOUNT_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    return true;
  }

  async getUser(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['userDetail'],
    });
    return user;
  }

  async getFamilyNameAndIsBelongToTemple(userId: number, templeId: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where({
        id: userId,
      })
      .leftJoinAndSelect('user.family', 'family')
      .leftJoinAndSelect(
        'family.familyTemples',
        'familyTemples',
        'familyTemples.templeId = :templeId AND familyTemples.isDeleted = false',
        { templeId },
      )
      .getOne();

    if (!user) {
      throw new HttpException(
        ErrorMessage.ACCOUNT_NOT_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!user.family) {
      return {
        familyName: null,
        isBelongToTemple: false,
      };
    }

    return {
      familyName: user.family.name,
      isBelongToTemple: !!user.family.familyTemples.length,
    };
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async getUserInFamily(getFamilyMembersArgs: GetFamilyMembersArgs) {
    const { id, name, address, email, phone, roleFilter } =
      getFamilyMembersArgs;

    const query = this.userRepository
      .createQueryBuilder('user')
      .where({
        familyId: id,
      })
      .leftJoinAndSelect('user.userDetail', 'userDetail');

    if (name) {
      query.andWhere('userDetail.name LIKE :name', { name: `%${name}%` });
    }

    if (address) {
      query.andWhere('userDetail.address LIKE :address', {
        address: `%${address}%`,
      });
    }

    if (email) {
      query.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }

    if (phone) {
      query.andWhere('userDetail.phone LIKE :phone', { phone: `%${phone}%` });
    }

    if (roleFilter.length) {
      query.andWhere('user.role IN (:...roleFilter)', { roleFilter });
    }

    const [data, count] = await query.getManyAndCount();
    return returnPagingData(data, count, getFamilyMembersArgs);
  }

  removeFamilyMember(userData: IUserData, familyMemberId: number) {
    return this.dataSource.transaction(async (entityManager: EntityManager) => {
      const userRepository = entityManager.getRepository(User);

      const user = await userRepository.findOne({
        where: {
          id: familyMemberId,
          familyId: userData.familyId,
        },
        relations: ['family'],
      });

      if (!user) {
        throw new HttpException(
          ErrorMessage.ACCOUNT_NOT_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (user.family.adminId !== userData.id) {
        throw new HttpException(
          ErrorMessage.NO_PERMISSION,
          HttpStatus.BAD_REQUEST,
        );
      }

      return await userRepository.update(familyMemberId, {
        familyId: null,
        role: ERole.PUBLIC_USER,
      });
    });
  }
}
