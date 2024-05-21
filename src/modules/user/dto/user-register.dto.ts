import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EGender, ERole } from 'src/core/enum/default.enum';

export class VUserRegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(EGender)
  @IsNotEmpty()
  gender: EGender;

  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  birthday: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  role: ERole;
}
