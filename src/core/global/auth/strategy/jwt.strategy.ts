import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IJwtPayload } from '../interface/auth.interface';
import { UserService } from '@modules/user/user.service';
import { ErrorMessage } from '@core/enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: IJwtPayload) {
    const user = await this.userService.getUserById(payload.id);
    if (!user) {
      throw new HttpException(
        ErrorMessage.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (
      user.passwordChangedAt &&
      payload.iat < user.passwordChangedAt.getTime() / 1000
    ) {
      throw new HttpException(
        ErrorMessage.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return payload;
  }
}
