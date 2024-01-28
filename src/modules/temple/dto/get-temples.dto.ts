import { IPaginationQuery } from '@core/interface/default.interface';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class VGetTemplesDto implements IPaginationQuery {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsNumber()
  familyId?: number;

  @IsNumber()
  page: number;

  @IsNumber()
  take: number;

  @IsNumber()
  skip: number;
}
