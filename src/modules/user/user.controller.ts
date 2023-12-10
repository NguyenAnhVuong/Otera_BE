import { Body, Controller, Post } from '@nestjs/common';
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
  userRegister(@HasuraBody('input') body: VUserRegisterDto) {
    return this.userService.userRegister(body);
  }

  @Public()
  @Post('/login')
  userLogin(@Body() userLogin: VUserLoginDto) {
    return this.userService.userLogin(userLogin);
  }

  @Public()
  @Post('/refresh-token')
  refreshToken(@Body() body: VRefreshToken) {
    return this.userService.refreshToken(body);
  }
}
