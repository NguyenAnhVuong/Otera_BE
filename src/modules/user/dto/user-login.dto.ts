import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class VUserLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
