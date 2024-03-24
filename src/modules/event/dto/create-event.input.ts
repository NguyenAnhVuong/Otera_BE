import { ERole } from '@core/enum';
import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
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
  @IsNotEmpty()
  @Type(() => Date)
  @Field(() => Date)
  startDateBooking: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @Field(() => Date)
  endDateBooking: Date;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  address: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  phone: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  email: string;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  maxParticipant: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(ERole, { each: true })
  @Field(() => [ERole])
  roles: ERole[];
}
