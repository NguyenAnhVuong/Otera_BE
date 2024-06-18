import { ERole } from '@core/enum';
import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class VCreateEventInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  name: string;

  @IsBoolean()
  @Field(() => Boolean)
  isFreeOpen: boolean;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  avatar: string;

  @IsArray()
  @IsOptional()
  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  images: string[];

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  description: string;

  @IsDate()
  @IsNotEmpty()
  @Field(() => Date)
  @Type(() => Date)
  startDateEvent: Date;

  @IsDate()
  @IsNotEmpty()
  @Field(() => Date)
  @Type(() => Date)
  endDateEvent: Date;

  @IsDate()
  @Type(() => Date)
  @Field(() => Date, { nullable: true })
  @IsOptional()
  startDateBooking: Date;

  @IsDate()
  @Type(() => Date)
  @Field(() => Date, { nullable: true })
  @IsOptional()
  endDateBooking: Date;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  address: string;

  @IsString()
  @Field(() => String)
  phone: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  email: string;

  @IsNumber()
  @Field(() => Number, { nullable: true })
  @IsOptional()
  maxParticipant?: number;

  @IsArray()
  @ArrayUnique()
  @IsEnum(ERole, { each: true })
  @Field(() => [ERole], { nullable: true })
  @IsOptional()
  roles?: ERole[];
}
