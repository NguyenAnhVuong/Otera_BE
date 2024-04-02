import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { VCreateEventInput } from './create-event.input';

@InputType()
export class VUpdateEventInput extends PartialType(VCreateEventInput) {
  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int)
  id: number;

  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isDeleted: boolean;
}
