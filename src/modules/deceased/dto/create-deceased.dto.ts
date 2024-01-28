import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EGender } from 'src/core/enum/default.enum';

export class VCreateDeceasedDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  dateOfDeath: Date;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  templeId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  birthday: Date;

  @IsString()
  @IsOptional()
  address: string;

  @IsEnum(EGender)
  @IsNotEmpty()
  @Type(() => Number)
  gender: EGender;

  @IsString()
  @IsOptional()
  citizenNumber: string;
}
