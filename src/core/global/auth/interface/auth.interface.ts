import { ERole } from 'src/core/enum/default.enum';

export interface IResponseAuthUser {
  id: number;
  name: string;
  avatar?: string;
  email: string;
  role: ERole;
}

export interface IResponseAuth {
  user: IResponseAuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface IJwtPayload {
  id: number;
  email: string;
  avatar: string;
  name: string;
  role: ERole;
}

export interface IResponseRefreshToken {
  accessToken: string;
  refreshToken: string;
}
