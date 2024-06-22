import { EStatus } from '@core/enum';
import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class VUpdateDeceasedStatusInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @Field(() => EStatus)
  @IsEnum(EStatus)
  @IsNotEmpty()
  status: EStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  rejectReason?: string;
}
