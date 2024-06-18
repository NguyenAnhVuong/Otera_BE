import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

@InputType()
export class UpdateNotificationInput {
  @Field(() => Int)
  @IsNumber()
  @IsNotEmpty()
  id!: number;

  @Field(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  createdAt?: Date;
}
