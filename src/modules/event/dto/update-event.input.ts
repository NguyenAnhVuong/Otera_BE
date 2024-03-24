import { ERole } from '@core/enum';
import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
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
import { VCreateEventInput } from './create-event.input';

@InputType()
export class VUpdateEventInput extends PartialType(VCreateEventInput) {
  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int)
  id: number;
}
