import { IsString } from 'class-validator';

export class VRefreshToken {
  @IsString()
  refreshToken: string;
}
