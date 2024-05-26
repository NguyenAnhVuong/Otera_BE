import { EGender } from '@core/enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class VUpdateDeceasedInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Type(() => String)
  dateOfDeath?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @Type(() => String)
  birthday?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => EGender, { nullable: true })
  @IsEnum(EGender)
  @IsOptional()
  gender?: EGender;

  @Field(() => String, { nullable: true })
  @IsOptional()
  citizenNumber?: string;

  @Field(() => Int, { nullable: true })
  templeId: number;
}
