import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@InputType()
export class CancelDeathAnniversaryInput {
  @Field(() => Int)
  @IsNumber()
  id: number;
}
