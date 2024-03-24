import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

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
}
