import { Controller, Post } from '@nestjs/common';
import { HasuraBody } from 'src/core/decorator/hasuraBody.decorator';
import { Public } from 'src/core/decorator/public.decorator';
import { VRefreshToken } from './dto/refresh-token.dto';
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
  userLogin(@HasuraBody('input') userLogin: VUserLoginDto) {
    return this.userService.userLogin(userLogin);
  }

  @Public()
  @Post('/refresh-token')
  refreshToken(@HasuraBody('input') body: VRefreshToken) {
    return this.userService.refreshToken(body);
  }
}
