import { ERole } from '@core/enum';

export interface IUserData {
  id: number;
  email: string;
  name: string;
  role: ERole;
  fid?: number;
  tid?: number[];
  [key: string]: any;
}

export interface IPaginationQuery {
  page?: number;
  take?: number;
  skip?: number;
  [key: string]: any;
}

export interface IPaginationResponse {
  data: any;
  totalItems: number;
  page: number;
  totalPages: number;
  take: number;
}
