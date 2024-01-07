import { Roles } from '@core/decorator/roles.decorator';
import { UserData } from '@core/decorator/user.decorator';
import { ERole } from '@core/enum';
import { IUserData } from '@core/interface/default.interface';
import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { HasuraBody } from 'src/core/decorator/hasuraBody.decorator';
import { Public } from 'src/core/decorator/public.decorator';
import { VUserLoginDto } from './dto/user-login.dto';
import { VUserRegisterDto } from './dto/user-register.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('/register')
  userRegister(@HasuraBody('input') userRegister: VUserRegisterDto) {
    return this.userService.userRegister(userRegister);
  }

  @Public()
  @Post('/login')
  userLogin(
    @HasuraBody('input') userLogin: VUserLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.userService.userLogin(userLogin, response);
  }

  @Public()
  @Post('/refresh-token')
  refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { refreshToken } = request.cookies;
    return this.userService.refreshToken(refreshToken, response);
  }

  @Roles(Object.values(ERole))
  @Post('/logout')
  userLogout(
    @UserData() userData: IUserData,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.userService.userLogout(userData, response);
  }
}
