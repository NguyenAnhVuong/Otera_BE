import { ERole } from 'src/core/enum/default.enum';

export interface IResponseAuthUser {
  id: number;
  name: string;
  avatar?: string;
  email: string;
  role: ERole;
  familyId?: number;
  templeId?: number;
}

export interface IResponseAuth {
  user: IResponseAuthUser;
  accessToken: string;
}

export interface IJwtPayload {
  id: number;
  email: string;
  avatar: string;
  name: string;
  role: ERole;
  fid?: number;
  tid?: number;
}

export interface IResponseRefreshToken {
  accessToken: string;
}
