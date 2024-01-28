import { IUserData } from '@core/interface/default.interface';
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
    return this.dataSource.transaction(async (entityManager: EntityManager) => {
      const userDetail = {
        name: userRegister.name,
        birthday: userRegister.birthday,
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
      delete newUser.password;

      return newUser;
    });
  }

  async userLogin(
    userLogin: VUserLoginDto,
    response: Response,
  ): Promise<IResponseAuth> {
    const user = await this.userRepository.findOne({
      where: {
        email: userLogin.email,
      },
      relations: ['userDetail'],
    });

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

    const authUserData: IResponseAuthUser = {
      id: user.id,
      email: user.email,
      avatar: user.userDetail.avatar,
      name: user.userDetail.name,
      role: user.role,
      familyId: user.familyId,
    };

    return await this.returnResponseAuthUser(authUserData, response);
  }

  async refreshToken(
    refreshToken: string,
    response: Response,
  ): Promise<IResponseRefreshToken> {
    const user = await this.userRepository.findOne({
      where: {
        refreshToken,
      },
      relations: ['userDetail'],
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
    };

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<number>(
        EConfiguration.REFRESH_TOKEN_EXPIRES_IN,
      ),
    });

    await this.userRepository.update(authUserData.id, { refreshToken });
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
    const userList = await this.userRepository.find();

    return userList.map((user) => {
      delete user.password;
      delete user.refreshToken;
      return user;
    });
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
    await this.userRepository.update(userData.id, { refreshToken: null });
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    return true;
  }

  async getUser(userData: IUserData) {
    const user = await this.userRepository.findOne({
      where: {
        id: userData.id,
      },
      relations: ['userDetail'],
    });
    return user;
  }
}
