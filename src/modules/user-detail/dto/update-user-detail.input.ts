import { EGender } from '@core/enum';
import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';

@InputType()
export class VUpdateUserDetailInput {
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  name?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  avatar?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  phone?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  address?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  birthday?: string;

  @IsEnum(EGender)
  @Field(() => EGender, { nullable: true })
  gender?: EGender;
}
