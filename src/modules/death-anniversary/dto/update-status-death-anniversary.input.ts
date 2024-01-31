import { EStatus } from '@core/enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class UpdateStatusDeathAnniversaryInput {
  @IsNumber()
  @Field(() => Int)
  id: number;

  @IsEnum(EStatus)
  @Field(() => EStatus)
  status: EStatus;

  @IsDate()
  @Type(() => Date)
  @Field(() => Date, { nullable: true })
  @IsOptional()
  actualStartTime?: Date;

  @IsDate()
  @Type(() => Date)
  @Field(() => Date, { nullable: true })
  @IsOptional()
  actualEndTime?: Date;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  linkLiveStream?: string;
}
