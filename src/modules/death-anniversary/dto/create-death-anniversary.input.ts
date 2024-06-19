import { EDeathAnniversaryType } from '@core/enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
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
  @Field(() => Date)
  @IsNotEmpty()
  desiredStartTime: Date;

  @IsDate()
  @Type(() => Date)
  @Field(() => Date)
  @IsNotEmpty()
  desiredEndTime: Date;

  @IsString()
  @Field(() => String, { nullable: true })
  @IsOptional()
  note?: string;

  @IsBoolean()
  @Field(() => Boolean)
  @IsNotEmpty()
  isLiveStream: boolean;

  @IsEnum(EDeathAnniversaryType)
  @Field(() => EDeathAnniversaryType)
  deathAnniversaryType: EDeathAnniversaryType;

  @IsNumber({}, { each: true })
  @Field(() => [Int])
  @IsNotEmpty()
  offeringIds: number[];
}
