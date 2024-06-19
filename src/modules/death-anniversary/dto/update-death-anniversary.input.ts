import { EDeathAnniversaryType } from '@core/enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class UpdateDeathAnniversaryInput {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @IsDate()
  @Type(() => Date)
  @Field(() => Date, { nullable: true })
  @IsOptional()
  desiredStartTime?: Date;

  @IsDate()
  @Type(() => Date)
  @Field(() => Date, { nullable: true })
  @IsOptional()
  desiredEndTime: Date;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  note?: string;

  @Field(() => [Int], { nullable: true })
  @IsNumber({}, { each: true })
  @IsOptional()
  offeringIds?: number[];

  @Field(() => EDeathAnniversaryType, { nullable: true })
  @IsOptional()
  @IsEnum(EDeathAnniversaryType)
  deathAnniversaryType?: EDeathAnniversaryType;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isLiveStream?: boolean;
}
