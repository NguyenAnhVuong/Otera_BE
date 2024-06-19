import { EDeathAnniversaryStatus, EStatus } from '@core/enum';
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
export class TempleUpdateDeathAnniversaryInput {
  @IsNumber()
  @Field(() => Int)
  id: number;

  @IsEnum(EDeathAnniversaryStatus)
  @Field(() => EDeathAnniversaryStatus)
  status: EDeathAnniversaryStatus;

  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  enableUpdate?: boolean;

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

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  rejectReason?: string;
}
