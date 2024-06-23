import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class VChangePasswordInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
