import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EGender } from 'src/core/enum/default.enum';

export class VCreateDeceasedDto {
  @IsString()
  @IsNotEmpty()
  tombAddress: string;

  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  dateOfDeath: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  templeId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  birthday: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsEnum(EGender)
  @IsNotEmpty()
  gender: EGender;

  @IsString()
  @IsOptional()
  citizenNumber?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
