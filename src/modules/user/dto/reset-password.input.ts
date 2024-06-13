import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class VResetPasswordInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  token: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
