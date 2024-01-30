import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class CreateDeathAnniversaryInput {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @Field(() => Int)
  deceasedId: number;

  @IsDate()
  @Type(() => Date)
  @Field(() => String)
  @IsNotEmpty()
  desiredStartTime: Date;

  @IsDate()
  @Type(() => Date)
  @Field(() => String)
  @IsNotEmpty()
  desiredEndTime: Date;

  @IsString()
  @Field(() => String)
  @IsOptional()
  note?: string;

  @IsBoolean()
  @Field(() => Boolean)
  @IsNotEmpty()
  isLiveStream: boolean;
}
